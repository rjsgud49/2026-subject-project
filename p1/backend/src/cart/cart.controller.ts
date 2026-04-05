import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartDto } from './dto/add-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private getUserId(req: { headers: Record<string, string> }): number {
    const id = req.headers['x-user-id'];
    return id ? parseInt(id, 10) : 1;
  }

  @Get()
  findAll(@Req() req: any) {
    return this.cartService.findAll(this.getUserId(req));
  }

  @Post()
  add(@Req() req: any, @Body() body: AddCartDto) {
    return this.cartService.add(this.getUserId(req), body.course_id);
  }

  @Delete(':courseId')
  async remove(
    @Req() req: any,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    await this.cartService.remove(this.getUserId(req), courseId);
  }
}
