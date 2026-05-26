import {
  Body,
  Controller,
  Get,
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
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

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
    @CurrentUser() admin: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(admin.id, id, dto.role);
  }

  @Get('courses')
  courses() {
    return this.adminService.listAllCourses();
  }
}
