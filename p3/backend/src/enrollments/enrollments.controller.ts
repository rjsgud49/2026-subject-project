import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  AuthUser,
} from '../common/decorators/current-user.decorator';
import { EnrollmentsService } from './enrollments.service';
import { EnrollDto } from './dto/enroll.dto';
import { UpdateVideoProgressDto } from './dto/update-video-progress.dto';

@Controller('enrollments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('student')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.enrollmentsService.listMine(user.id);
  }

  @Post()
  enroll(@CurrentUser() user: AuthUser, @Body() dto: EnrollDto) {
    return this.enrollmentsService.enroll(user.id, dto.course_id);
  }

  @Get(':enrollmentId/progress')
  getProgress(
    @CurrentUser() user: AuthUser,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
  ) {
    return this.enrollmentsService.getProgress(user.id, enrollmentId);
  }

  @Put(':enrollmentId/videos/:videoId/progress')
  updateVideoProgress(
    @CurrentUser() user: AuthUser,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @Param('videoId', ParseIntPipe) videoId: number,
    @Body() dto: UpdateVideoProgressDto,
  ) {
    return this.enrollmentsService.upsertProgress(
      user.id,
      enrollmentId,
      videoId,
      dto,
    );
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.removeMine(user.id, id);
  }
}
