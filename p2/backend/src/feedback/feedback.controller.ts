import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { AuthGuard } from '@nestjs/passport';
import {
  CurrentUser,
  AuthUser,
} from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { TeacherFeedbackUpdateDto } from './dto/teacher-feedback-update.dto';
import { FeedbackService } from './feedback.service';
import { p2DiskStorage } from '../upload.storage';
import { assertStudentFeedbackUpload } from '../upload.validation';

@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('feedback/upload')
  @Roles('student')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: p2DiskStorage(),
      limits: { fileSize: 30 * 1024 * 1024 },
    }),
  )
  uploadAttachment(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): { url: string; filename: string; stored: string } {
    if (!file) throw new BadRequestException('파일이 없습니다.');
    assertStudentFeedbackUpload(file);
    return {
      url: `/api/v1/files/${file.filename}`,
      filename: file.originalname,
      stored: file.filename,
    };
  }

  @Post('feedback')
  @Roles('student')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateFeedbackDto) {
    return this.feedbackService.createByStudent(user.id, dto);
  }

  @Get('feedback/mine')
  @Roles('student')
  mine(@CurrentUser() user: AuthUser) {
    return this.feedbackService.listMine(user.id);
  }

  @Get('teacher/feedback')
  @Roles('teacher')
  teacherList(@CurrentUser() user: AuthUser) {
    return this.feedbackService.listForTeacher(user.id);
  }

  @Get('teacher/feedback/:id')
  @Roles('teacher')
  teacherGet(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.feedbackService.getOneForTeacher(user.id, id);
  }

  @Patch('teacher/feedback/:id')
  @Roles('teacher')
  teacherUpdate(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TeacherFeedbackUpdateDto,
  ) {
    return this.feedbackService.updateByTeacher(user.id, id, dto);
  }
}
