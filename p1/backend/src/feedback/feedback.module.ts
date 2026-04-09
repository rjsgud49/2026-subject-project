import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackSubmission } from '../entities/feedback-submission.entity';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

@Module({
  imports: [TypeOrmModule.forFeature([FeedbackSubmission])],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
