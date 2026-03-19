import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';

@Controller()
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  private getUserId(req: { headers: Record<string, string> }): number {
    const id = req.headers['x-user-id'];
    return id ? parseInt(id, 10) : 1;
  }

  @Get('courses/:courseId/questions')
  findByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('page') page?: string,
    @Query('size') size?: string,
  ) {
    return this.questionsService.findByCourse(
      courseId,
      page ? parseInt(page, 10) : 1,
      size ? parseInt(size, 10) : 20,
    );
  }

  @Post('courses/:courseId/questions')
  create(
    @Req() req: any,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() body: { title: string; body: string; is_private?: boolean },
  ) {
    return this.questionsService.create(
      courseId,
      this.getUserId(req),
      body,
    );
  }

  @Get('questions/:questionId')
  findOne(@Param('questionId', ParseIntPipe) questionId: number) {
    return this.questionsService.findOne(questionId);
  }

  @Put('questions/:questionId')
  update(
    @Req() req: any,
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() body: { title?: string; body?: string },
  ) {
    return this.questionsService.update(
      questionId,
      this.getUserId(req),
      body,
    );
  }

  @Delete('questions/:questionId')
  async remove(
    @Req() req: any,
    @Param('questionId', ParseIntPipe) questionId: number,
  ) {
    await this.questionsService.remove(questionId, this.getUserId(req));
  }

  @Post('questions/:questionId/answers')
  createAnswer(
    @Req() req: any,
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() body: { body: string },
  ) {
    return this.questionsService.createAnswer(
      questionId,
      this.getUserId(req),
      body,
    );
  }
}
