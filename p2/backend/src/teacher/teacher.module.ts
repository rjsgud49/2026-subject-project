import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../entities/course.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { TeacherRevenueLine } from '../entities/teacher-revenue-line.entity';
import { Question } from '../entities/question.entity';
import { Answer } from '../entities/answer.entity';
import { User } from '../entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      Enrollment,
      User,
      TeacherRevenueLine,
      Question,
      Answer,
    ]),
    AuthModule,
  ],
  controllers: [TeacherController],
  providers: [TeacherService, RolesGuard],
})
export class TeacherModule {}
