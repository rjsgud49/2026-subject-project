import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from '../entities/cart-item.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItem, Enrollment]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
