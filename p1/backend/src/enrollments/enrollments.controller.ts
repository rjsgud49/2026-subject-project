import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  private getUserId(req: { headers: Record<string, string> }): number {
    const id = req.headers['x-user-id'];
    return id ? parseInt(id, 10) : 1;
  }

  @Get()
  findAll(@Req() req: any, @Query('status') status?: string) {
    return this.enrollmentsService.findAll(this.getUserId(req), status);
  }

  @Post()
  enroll(
    @Req() req: any,
    @Body('course_id', ParseIntPipe) courseId: number,
  ) {
    return this.enrollmentsService.enroll(this.getUserId(req), courseId);
  }

  @Get(':enrollmentId')
  findOne(
    @Req() req: any,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
  ) {
    return this.enrollmentsService.findOne(
      enrollmentId,
      this.getUserId(req),
    );
  }

  @Get(':enrollmentId/progress')
  getProgress(
    @Req() req: any,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
  ) {
    return this.enrollmentsService.getProgress(
      enrollmentId,
      this.getUserId(req),
    );
  }

  @Put(':enrollmentId/videos/:videoId/progress')
  async updateProgress(
    @Req() req: any,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @Param('videoId', ParseIntPipe) videoId: number,
    @Body() body: { last_second?: number; completed?: boolean },
  ) {
    return this.enrollmentsService.upsertProgress(
      enrollmentId,
      this.getUserId(req),
      videoId,
      body,
    );
  }
}
