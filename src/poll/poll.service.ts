import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  Poll,
} from './poll.entity';

import {
  PollOption,
} from '../poll-option/poll-option.entity';

import {
  PollVote,
} from '../poll-vote/poll-vote.entity';

import {
  User,
} from '../users/user.entity';

import {
  PollMediaType,
} from '../poll-option/poll-option.entity';

@Injectable()
export class PollService {

  constructor(

    @InjectRepository(Poll)
    private readonly pollRepository:
      Repository<Poll>,

    @InjectRepository(PollOption)
    private readonly optionRepository:
      Repository<PollOption>,

    @InjectRepository(PollVote)
    private readonly voteRepository:
      Repository<PollVote>,

    @InjectRepository(User)
    private readonly userRepository:
      Repository<User>,

  ) {}

  // ==========================================
  // CREATE POLL
  // ==========================================

  async create(
    question: string,
    category: string,
    options: Array<{
      caption: string;
      mediaUrl: string;
      mediaType: PollMediaType;
    }>,
    userId: number,
  ) {

    if (
      !question ||
      !question.trim()
    ) {
      throw new BadRequestException(
        'Poll question is required',
      );
    }

    if (
      options.length < 2 ||
      options.length > 4
    ) {
      throw new BadRequestException(
        'A poll must have between 2 and 4 options',
      );
    }

    const creator =
      await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });

    if (!creator) {
      throw new NotFoundException(
        'User not found',
      );
    }

    for (const option of options) {

      if (!option.caption?.trim()) {
        throw new BadRequestException(
          'Every poll option needs a caption',
        );
      }

      if (!option.mediaUrl) {
        throw new BadRequestException(
          'Every poll option needs media',
        );
      }

      if (
        ![
          PollMediaType.IMAGE,
          PollMediaType.VIDEO,
        ].includes(option.mediaType)
      ) {
        throw new BadRequestException(
          'Invalid poll media type',
        );
      }
    }

    const poll =
      this.pollRepository.create({

        question:
          question.trim(),

        category:
          category?.trim() || 'Other',

        creatorId:
          userId,

        creator,

        totalVotes:
          0,

      });

    const savedPoll =
      await this.pollRepository.save(
        poll,
      );

    const pollOptions =
      options.map(
        option =>
          this.optionRepository.create({

            pollId:
              savedPoll.id,

            poll:
              savedPoll,

            caption:
              option.caption.trim(),

            mediaUrl:
              option.mediaUrl,

            mediaType:
              option.mediaType,

            voteCount:
              0,

          }),
      );

    await this.optionRepository.save(
      pollOptions,
    );

    return this.findOne(
      savedPoll.id,
    );
  }

  // ==========================================
  // GET POLL FEED
  // ==========================================

  async findAll(
    page = 1,
    limit = 15,
  ) {

    page =
      Math.max(
        1,
        Number(page) || 1,
      );

    limit =
      Math.min(
        Math.max(
          1,
          Number(limit) || 15,
        ),
        50,
      );

    const skip =
      (page - 1) * limit;

    const [
      polls,
      total,
    ] =
      await this.pollRepository.findAndCount({

        relations: [
          'creator',
          'options',
        ],

        order: {
          createdAt: 'DESC',
        },

        skip,

        take: limit,

      });

    return {

      data:
        polls.map(
          poll =>
            this.serializePoll(
              poll,
            ),
        ),

      total,

      page,

      limit,

      hasMore:
        skip + polls.length < total,

    };
  }

  // ==========================================
  // GET ONE POLL
  // ==========================================

  async findOne(
    id: number,
  ) {

    const poll =
      await this.pollRepository.findOne({

        where: {
          id,
        },

        relations: [
          'creator',
          'options',
        ],

      });

    if (!poll) {
      throw new NotFoundException(
        'Poll not found',
      );
    }

    return this.serializePoll(
      poll,
    );
  }

  // ==========================================
  // VOTE
  // ==========================================

  async vote(
    pollId: number,
    optionId: number,
    userId: number,
  ) {

    const poll =
      await this.pollRepository.findOne({
        where: {
          id: pollId,
        },
      });

    if (!poll) {
      throw new NotFoundException(
        'Poll not found',
      );
    }

    const option =
      await this.optionRepository.findOne({
        where: {
          id: optionId,
          pollId,
        },
      });

    if (!option) {
      throw new NotFoundException(
        'Poll option not found',
      );
    }

    const existingVote =
      await this.voteRepository.findOne({
        where: {
          pollId,
          userId,
        },
      });

    if (existingVote) {
      throw new ConflictException(
        'You have already voted on this poll',
      );
    }

    const vote =
      this.voteRepository.create({

        pollId,

        poll,

        optionId,

        option,

        userId,

      });

    await this.voteRepository.save(
      vote,
    );

    option.voteCount =
      (option.voteCount || 0) + 1;

    poll.totalVotes =
      (poll.totalVotes || 0) + 1;

    await this.optionRepository.save(
      option,
    );

    await this.pollRepository.save(
      poll,
    );

    return this.findOne(
      pollId,
    );
  }

  // ==========================================
  // CHECK USER VOTE
  // ==========================================

  async getUserVote(
    pollId: number,
    userId: number,
  ) {

    const vote =
      await this.voteRepository.findOne({
        where: {
          pollId,
          userId,
        },
      });

    return {

      voted:
        !!vote,

      optionId:
        vote?.optionId || null,

    };
  }

  // ==========================================
  // DELETE POLL
  // ==========================================

  async delete(
    pollId: number,
    userId: number,
  ) {

    const poll =
      await this.pollRepository.findOne({
        where: {
          id: pollId,
        },
      });

    if (!poll) {
      throw new NotFoundException(
        'Poll not found',
      );
    }

    if (
      poll.creatorId !== userId
    ) {
      throw new ForbiddenException(
        'You can only delete your own polls',
      );
    }

    await this.pollRepository.delete(
      pollId,
    );

    return {
      message:
        'Poll deleted successfully',
    };
  }

  // ==========================================
  // SERIALIZE
  // ==========================================

  private serializePoll(
    poll: Poll,
  ) {

    const totalVotes =
      poll.totalVotes || 0;

    return {

      id:
        poll.id,

      question:
        poll.question,

      category:
        poll.category,

      creatorId:
        poll.creatorId,

      creatorUsername:
        poll.creator?.username ||
        'User',

      creatorAvatar:
        poll.creator?.avatar ||
        null,

      totalVotes,

      createdAt:
        poll.createdAt,

      options:
        (poll.options || []).map(
          option => {

            const percentage =
              totalVotes > 0
                ? Math.round(
                    (
                      option.voteCount /
                      totalVotes
                    ) * 100,
                  )
                : 0;

            return {

              id:
                option.id,

              caption:
                option.caption,

              mediaUrl:
                option.mediaUrl,

              mediaType:
                option.mediaType,

              voteCount:
                option.voteCount || 0,

              percentage,

            };

          },
        ),

    };
  }
}