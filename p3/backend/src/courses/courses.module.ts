import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../entities/course.entity';
import { User } from '../entities/user.entity';
import { CoursePublicService } from './course-public.service';
import { PublicCoursesController } from './public-courses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Course, User])],
  controllers: [PublicCoursesController],
  providers: [CoursePublicService],
})
export class CoursesModule {}
