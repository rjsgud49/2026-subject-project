import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import {
  CurrentUser,
  AuthUser,
} from '../common/decorators/current-user.decorator';

@Controller()
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

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
  @UseGuards(AuthGuard('jwt'))
  create(
    @CurrentUser() user: AuthUser,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() body: CreateQuestionDto,
  ) {
    return this.questionsService.create(courseId, user.id, body);
  }

  @Get('questions/:questionId')
  findOne(@Param('questionId', ParseIntPipe) questionId: number) {
    return this.questionsService.findOne(questionId);
  }

  @Put('questions/:questionId')
  @UseGuards(AuthGuard('jwt'))
  update(
    @CurrentUser() user: AuthUser,
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() body: UpdateQuestionDto,
  ) {
    return this.questionsService.update(questionId, user.id, body);
  }

  @Delete('questions/:questionId')
  @UseGuards(AuthGuard('jwt'))
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('questionId', ParseIntPipe) questionId: number,
  ) {
    await this.questionsService.remove(questionId, user.id);
  }

  @Post('questions/:questionId/answers')
  @UseGuards(AuthGuard('jwt'))
  createAnswer(
    @CurrentUser() user: AuthUser,
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() body: CreateAnswerDto,
  ) {
    return this.questionsService.createAnswer(questionId, user.id, body);
  }
}
