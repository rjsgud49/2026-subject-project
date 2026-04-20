import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../entities/course.entity';
import { CoursePublicService } from './course-public.service';
import { PublicCoursesController } from './public-courses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Course])],
  controllers: [PublicCoursesController],
  providers: [CoursePublicService],
})
export class CoursesModule {}
