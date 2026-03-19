import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from '../entities/enrollment.entity';
import { VideoProgress } from '../entities/video-progress.entity';
import { CourseVideo } from '../entities/course-video.entity';
import { CartItem } from '../entities/cart-item.entity';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Enrollment,
      VideoProgress,
      CourseVideo,
      CartItem,
    ]),
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
})
export class EnrollmentsModule {}
