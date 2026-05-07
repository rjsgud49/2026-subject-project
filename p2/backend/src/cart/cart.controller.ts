import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  AuthUser,
} from '../common/decorators/current-user.decorator';
import { CartService } from './cart.service';
import { AddCartDto } from './dto/add-cart.dto';

@Controller('cart')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('student')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.cartService.list(user.id);
  }

  @Post()
  add(@CurrentUser() user: AuthUser, @Body() dto: AddCartDto) {
    return this.cartService.add(user.id, dto.course_id);
  }

  @Delete(':courseId')
  @HttpCode(204)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    await this.cartService.remove(user.id, courseId);
  }
}
