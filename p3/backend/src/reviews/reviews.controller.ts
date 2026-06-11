import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller()
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get('reviews')
  list(@Query('limit') limit?: string) {
    return this.reviews.listPublic(limit ? Number(limit) : 12);
  }

  @Post('reviews')
  @UseGuards(AuthGuard('jwt'))
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReviewDto) {
    return this.reviews.create(user?.id ?? null, dto);
  }

  @Get('admin/reviews/pending')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  listPending() {
    return this.reviews.listPending();
  }

  @Patch('admin/reviews/:id/approve')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.reviews.approve(id);
  }

  @Delete('admin/reviews/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.reviews.reject(id);
  }
}
