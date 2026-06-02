import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Library } from './library.entity';

import { Video } from '../videos/video.entity';

@Injectable()

export class LibraryService {

  constructor(

    @InjectRepository(Library)
    private libraryRepository: Repository<Library>,

    @InjectRepository(Video)
    private videoRepository: Repository<Video>,

  ) {}

  // =====================================
  // ADD TO LIBRARY
  // =====================================

  async addToLibrary(
  userId: number,
  productId: number,
) {

  const existing =
    await this.libraryRepository.findOne({
      where: {
        userId,
        productId,
      },
    });

  if (existing) {
    console.log(
      'LIBRARY ENTRY ALREADY EXISTS',
      userId,
      productId,
    );

    return existing;
  }

  console.log(
    'LIBRARY ENTRY CREATED',
    userId,
    productId,
  );

  const item =
    this.libraryRepository.create({
      userId,
      productId,
    });

  return this.libraryRepository.save(item);

}
  // =====================================
  // GET USER LIBRARY
  // =====================================

  async getUserLibrary(
  userId: number,
) {

  const items =
    await this.libraryRepository.find({
      where: { userId },
      order: {
        createdAt: 'DESC',
      },
    });

  const productIds =
    items.map(i => i.productId);

  if (!productIds.length) {
    return [];
  }

  const books =
  await this.videoRepository.find({
    where:
      productIds.map(id => ({
        id,
        type: 'ebook',
      })),

      relations: ['creator'],

    });

  return books.map(book => ({

    id: book.id,

    title: book.title,

    coverImage:
      book.coverUrl,

    fileUrl:
      book.fileUrl,

    creatorUsername:
      book.creator?.username,

  }));

}

async userOwnsBook(
  userId: number,
  productId: number,
) {

  const item =
    await this.libraryRepository.findOne({
      where: {
        userId,
        productId,
      },
    });

  return !!item;

}

async getOwnedBook(
  userId: number,
  productId: number,
) {

  const owns =
    await this.userOwnsBook(
      userId,
      productId,
    );

  if (!owns) {
    throw new NotFoundException(
      'You do not own this ebook',
    );
  }

  const book =
    await this.videoRepository.findOne({
      where: {
        id: productId,
      },
    });

  if (!book) {
    throw new NotFoundException(
      'Book not found',
    );
  }

  return {
    id: book.id,
    title: book.title,
    fileUrl: book.fileUrl,
  };

}

}