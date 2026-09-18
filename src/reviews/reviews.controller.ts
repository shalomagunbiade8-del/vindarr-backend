import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {

  constructor(
    private readonly reviewsService:
      ReviewsService,
  ) {}


  // ==========================================
  // POST REVIEW
  // ==========================================

  @UseGuards(AuthGuard('jwt'))
  @Post()
  createReview(
    @Body() dto: CreateReviewDto,
    @Req() req,
  ) {

    return this.reviewsService.create(
      dto,
      req.user,
    );

  }


  // ==========================================
  // GET REVIEWS
  // ==========================================

  @Get(':productId')
  getProductReviews(
    @Param(
      'productId',
      ParseIntPipe,
    )
    productId: number,
  ) {

    return this.reviewsService.findByProduct(
      productId,
    );

  }


  // ==========================================
  // GET SUMMARY
  // ==========================================

  @Get(':productId/summary')
  getProductRating(
    @Param(
      'productId',
      ParseIntPipe,
    )
    productId: number,
  ) {

    return this.reviewsService.getProductRating(
      productId,
    );

  }


  // ==========================================
  // DELETE
  // ==========================================

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  deleteReview(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Req() req,
  ) {

    return this.reviewsService.delete(
      id,
      req.user,
    );

  }

}