import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
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

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.removeMine(user.id, id);
  }
}
