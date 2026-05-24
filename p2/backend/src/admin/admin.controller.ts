import {
  Body,
  Controller,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  stats() {
    return this.adminService.stats();
  }

  @Get('users')
  users() {
    return this.adminService.listUsers();
  }

  @Patch('users/:id/role')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(id, dto.role);
  }

  @Get('courses')
  courses() {
    return this.adminService.listAllCourses();
  }

  @Patch('courses/:id/published')
  setCoursePublished(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isPublished: boolean; rejectionReason?: string },
  ) {
    return this.adminService.setCoursePublished(id, !!body.isPublished, body.rejectionReason);
  }

  @Delete('courses/:id')
  removeCourse(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.removeCourse(id);
  }

  @Get('qna')
  qna() {
    return this.adminService.listAllQna();
  }

  @Delete('qna/questions/:questionId')
  removeQuestion(@Param('questionId', ParseIntPipe) questionId: number) {
    return this.adminService.removeQuestion(questionId);
  }

  @Delete('qna/answers/:answerId')
  removeAnswer(@Param('answerId', ParseIntPipe) answerId: number) {
    return this.adminService.removeAnswer(answerId);
  }
}
