import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import { Review } from './review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

import { Video } from '../videos/video.entity';

@Injectable()
export class ReviewsService {

  constructor(

    @InjectRepository(Review)
    private readonly reviewRepository:
      Repository<Review>,

    @InjectRepository(Video)
    private readonly videoRepository:
      Repository<Video>,

  ) {}


  // ==========================================
  // GET AUTHENTICATED USER ID
  // ==========================================

  private getUserId(
    user: any,
  ): number {

    const rawId =
      user?.id ??
      user?.userId ??
      user?.sub;

    const userId =
      Number(rawId);

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {

      throw new UnauthorizedException(
        'Authenticated user ID is missing or invalid',
      );

    }

    return userId;

  }


  // ==========================================
  // CREATE REVIEW
  // ==========================================

  async create(
    dto: CreateReviewDto,
    user: any,
  ) {

    const userId =
      this.getUserId(user);

    const productId =
      Number(dto.productId);

    const rating =
      Number(dto.rating);

    const comment =
      String(dto.comment || '').trim();


    // ==========================================
    // VALIDATE PRODUCT
    // ==========================================

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {

      throw new BadRequestException(
        'Invalid productId',
      );

    }


    // ==========================================
    // VALIDATE RATING
    // ==========================================

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {

      throw new BadRequestException(
        'Rating must be between 1 and 5',
      );

    }


    // ==========================================
    // VALIDATE COMMENT
    // ==========================================

    if (!comment) {

      throw new BadRequestException(
        'Review comment is required',
      );

    }


    if (
      comment.length > 1000
    ) {

      throw new BadRequestException(
        'Review cannot exceed 1000 characters',
      );

    }


    // ==========================================
    // FIND PRODUCT
    // ==========================================

    const product =
      await this.videoRepository.findOne({

        where: {
          id: productId,
        },

      });


    if (!product) {

      throw new NotFoundException(
        'Product not found',
      );

    }


    // ==========================================
    // ONLY MARKETPLACE CONTENT
    // ==========================================

    const marketplaceTypes = [
      'fashion',
      'essential',
      'ebook',
    ];

    if (
      !marketplaceTypes.includes(
        String(product.type).toLowerCase(),
      )
    ) {

      throw new BadRequestException(
        'Reviews are only available for marketplace products',
      );

    }


    // ==========================================
    // CHECK EXISTING REVIEW
    // ==========================================

    const existing =
      await this.reviewRepository.findOne({

        where: {
          productId,
          userId,
        },

      });


    if (existing) {

      throw new ConflictException(
        'You have already reviewed this product',
      );

    }


    // ==========================================
    // CREATE
    // ==========================================

    const review =
      this.reviewRepository.create({

        productId,

        userId,

        rating,

        comment,

      });


    const saved =
      await this.reviewRepository.save(
        review,
      );


    // ==========================================
    // RETURN REVIEW
    // ==========================================

    return this.reviewRepository.findOne({

      where: {
        id: saved.id,
      },

      relations: [
        'user',
      ],

    });

  }


  // ==========================================
  // GET REVIEWS
  // ==========================================

  async findByProduct(
    productId: number,
  ) {

    const id =
      Number(productId);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      throw new BadRequestException(
        'Invalid product ID',
      );

    }


    const reviews =
      await this.reviewRepository.find({

        where: {
          productId: id,
        },

        relations: [
          'user',
        ],

        order: {
          createdAt: 'DESC',
        },

      });


    return reviews.map(
      (review) => ({

        id:
          review.id,

        productId:
          review.productId,

        rating:
          review.rating,

        comment:
          review.comment,

        username:
          review.user?.username ||
          'user',

        userAvatar:
          review.user?.avatar ||
          null,

        createdAt:
          review.createdAt,

      }),
    );

  }


  // ==========================================
  // RATING SUMMARY
  // ==========================================

  async getProductRating(
    productId: number,
  ) {

    const id =
      Number(productId);


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return {

        averageRating: 0,

        totalReviews: 0,

      };

    }


    const result =
      await this.reviewRepository

        .createQueryBuilder(
          'review',
        )

        .select(
          'COALESCE(AVG(review.rating), 0)',
          'averageRating',
        )

        .addSelect(
          'COUNT(review.id)',
          'totalReviews',
        )

        .where(
          'review.productId = :productId',
          {
            productId: id,
          },
        )

        .getRawOne();


    return {

      averageRating:
        Number(
          result?.averageRating || 0,
        ),

      totalReviews:
        Number(
          result?.totalReviews || 0,
        ),

    };

  }


  // ==========================================
  // DELETE REVIEW
  // ==========================================

  async delete(
    reviewId: number,
    user: any,
  ) {

    const userId =
      this.getUserId(user);

    const id =
      Number(reviewId);


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      throw new BadRequestException(
        'Invalid review ID',
      );

    }


    const review =
      await this.reviewRepository.findOne({

        where: {
          id,
        },

      });


    if (!review) {

      throw new NotFoundException(
        'Review not found',
      );

    }


    if (
      Number(review.userId) !==
      Number(userId)
    ) {

      throw new UnauthorizedException(
        'You can only delete your own review',
      );

    }


    await this.reviewRepository.delete({
      id,
    });


    return {
      success: true,
    };

  }

}