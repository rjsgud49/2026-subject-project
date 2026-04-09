import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoursesModule } from './courses/courses.module';
import { CartModule } from './cart/cart.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { QuestionsModule } from './questions/questions.module';
import { AuthModule } from './auth/auth.module';
import { FeedbackModule } from './feedback/feedback.module';
import {
  User,
  Course,
  CourseSection,
  CourseVideo,
  Enrollment,
  VideoProgress,
  CartItem,
  Question,
  Answer,
  FeedbackSubmission,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'p1_interview',
      entities: [
        User,
        Course,
        CourseSection,
        CourseVideo,
        Enrollment,
        VideoProgress,
        CartItem,
        Question,
        Answer,
        FeedbackSubmission,
      ],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      retryAttempts: 3,
      retryDelay: 2000,
    }),
    CoursesModule,
    CartModule,
    EnrollmentsModule,
    QuestionsModule,
    AuthModule,
    FeedbackModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
