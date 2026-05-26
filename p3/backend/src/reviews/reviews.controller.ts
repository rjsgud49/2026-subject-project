import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@Controller()
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get('reviews')
  list(@Query('limit') limit?: string) {
    return this.reviews.listPublic(limit ? Number(limit) : 12);
  }

  /** 로그인 사용자 리뷰 (표시명/태그라인은 사용자가 입력) */
  @Post('reviews')
  @UseGuards(AuthGuard('jwt'))
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReviewDto) {
    return this.reviews.create(user?.id ?? null, dto);
  }
}

