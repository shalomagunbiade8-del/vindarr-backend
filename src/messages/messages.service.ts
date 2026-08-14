import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
  DeepPartial,
} from 'typeorm';

import { Message } from './message.entity';
import { MessagesGateway } from './messages.gateway';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {

  constructor(

    @InjectRepository(Message)
    private readonly repo:
      Repository<Message>,

    private readonly gateway:
      MessagesGateway,

  ) {}


  // ==========================================
  // SEND MESSAGE
  // ==========================================

  async sendMessage(
    data: SendMessageDto,
    currentUser: any,
  ) {

    if (
      !currentUser?.username
    ) {

      throw new BadRequestException(
        'Authenticated user is required.',
      );

    }


    if (
      !data?.receiverUsername
    ) {

      throw new BadRequestException(
        'receiverUsername is required.',
      );

    }


    const text =
      data.text?.trim() || null;


    const attachmentUrl =
      data.attachmentUrl ||
      null;


    const attachmentType =
      data.attachmentType ||
      null;


    /*
     * A message must contain something.
     */

    if (
      !text &&
      !attachmentUrl
    ) {

      throw new BadRequestException(
        'Message cannot be empty.',
      );

    }


    /*
     * Do not allow replying to a
     * non-existent message.
     */

    let replyToId:
      number | null = null;


    if (
      data.replyToId
    ) {

      const original =
        await this.repo.findOne({

          where: {
            id: data.replyToId,
          },

        });


      if (!original) {

        throw new NotFoundException(
          'Message being replied to was not found.',
        );

      }


      /*
       * Prevent replying to a message
       * that isn't part of this conversation.
       */

      const sameConversation =
        (
          original.senderUsername ===
            currentUser.username &&
          original.receiverUsername ===
            data.receiverUsername
        )
        ||
        (
          original.senderUsername ===
            data.receiverUsername &&
          original.receiverUsername ===
            currentUser.username
        );


      if (!sameConversation) {

        throw new ForbiddenException(
          'You cannot reply to this message.',
        );

      }


      replyToId =
        original.id;

    }


    const msg:
      DeepPartial<Message> = {

      senderUsername:
        currentUser.username,

      receiverUsername:
        data.receiverUsername,

      text,

      attachmentUrl,

      attachmentType,

      replyToId,

    };


    const saved =
      await this.repo.save(msg);


    /*
     * Reload with reply information.
     */

    const completeMessage =
      await this.repo.findOne({

        where: {
          id: saved.id,
        },

        relations: [
          'replyTo',
        ],

      });


    if (!completeMessage) {

      throw new NotFoundException(
        'Message could not be loaded.',
      );

    }


    /*
     * Send through Socket.IO.
     */

    this.gateway.sendMessage(
      completeMessage,
    );


    return completeMessage;
  }


  // ==========================================
  // GET CONVERSATION
  // ==========================================

  async getConversation(
    user1: string,
    user2: string,
  ) {

    const messages =
      await this.repo
        .createQueryBuilder('message')

        .leftJoinAndSelect(
          'message.replyTo',
          'replyTo',
        )

        .where(

          `
          (
            message.senderUsername = :u1
            AND
            message.receiverUsername = :u2
          )
          `,

          {
            u1: user1,
            u2: user2,
          },

        )

        .orWhere(

          `
          (
            message.senderUsername = :u2
            AND
            message.receiverUsername = :u1
          )
          `,

          {
            u1: user1,
            u2: user2,
          },

        )

        .orderBy(
          'message.createdAt',
          'ASC',
        )

        .getMany();


    return messages;
  }


  // ==========================================
  // DELETE MESSAGE
  // ==========================================

  async deleteMessage(
    id: number,
    currentUser: any,
  ) {

    const msg =
      await this.repo.findOne({

        where: {
          id,
        },

      });


    if (!msg) {

      throw new NotFoundException(
        'Message not found.',
      );

    }


    if (
      msg.senderUsername !==
      currentUser.username
    ) {

      throw new ForbiddenException(
        'You can only delete your own messages.',
      );

    }


    await this.repo.delete(id);


    /*
     * Tell connected clients that
     * the message disappeared.
     */

    this.gateway.messageDeleted(
      id,
    );


    return {

      success: true,

      message:
        'Message deleted successfully.',

      id,

    };
  }


  // ==========================================
  // INBOX
  // ==========================================

  async getInbox(
    username: string,
  ) {

    const messages =
      await this.repo
        .createQueryBuilder('message')

        .leftJoinAndSelect(
          'message.replyTo',
          'replyTo',
        )

        .where(

          `
          message.senderUsername = :u
          OR
          message.receiverUsername = :u
          `,

          {
            u: username,
          },

        )

        .orderBy(
          'message.createdAt',
          'DESC',
        )

        .getMany();


    const map =
      new Map<
        string,
        Message
      >();


    messages.forEach(
      message => {

        const otherUser =
          message.senderUsername ===
          username

            ? message.receiverUsername

            : message.senderUsername;


        if (!otherUser) {
          return;
        }


        /*
         * Because messages are already
         * ordered newest first, the first
         * message is the latest message
         * for that conversation.
         */

        if (
          !map.has(otherUser)
        ) {

          map.set(
            otherUser,
            message,
          );

        }

      },
    );


    return Array.from(
      map.values(),
    );
  }
}