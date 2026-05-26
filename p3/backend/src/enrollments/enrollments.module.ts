import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from '../entities/enrollment.entity';
import { Course } from '../entities/course.entity';
import { EnrollmentVideoProgress } from '../entities/enrollment-video-progress.entity';
import { TeacherRevenueLine } from '../entities/teacher-revenue-line.entity';
import { StudyNote } from '../entities/study-note.entity';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Enrollment,
      Course,
      EnrollmentVideoProgress,
      TeacherRevenueLine,
      StudyNote,
    ]),
    AuthModule,
    CartModule,
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService, RolesGuard],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
