import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  AuthUser,
} from '../common/decorators/current-user.decorator';
import { TeacherService } from './teacher.service';
import { CreateCourseDto } from '../courses/dto/create-course.dto';
import { UpdateCourseDto } from '../courses/dto/update-course.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { p2DiskStorage } from '../upload.storage';
import {
  assertTeacherImageUpload,
  assertVideoCourseUpload,
} from '../upload.validation';

@Controller('teacher')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get('dashboard')
  dashboard(@CurrentUser() user: AuthUser) {
    return this.teacherService.getDashboard(user.id);
  }

  @Post('upload/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: p2DiskStorage(),
      limits: { fileSize: 12 * 1024 * 1024 },
    }),
  )
  uploadImage(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    void user;
    if (!file) throw new BadRequestException('파일이 없습니다.');
    assertTeacherImageUpload(file);
    return this.teacherService.mediaUploadResponse(file);
  }

  @Post('upload/video')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: p2DiskStorage(),
      limits: { fileSize: 52 * 1024 * 1024 },
    }),
  )
  uploadVideoLoose(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    void user;
    if (!file) throw new BadRequestException('파일이 없습니다.');
    assertVideoCourseUpload(file);
    return this.teacherService.mediaUploadResponse(file);
  }

  @Post('profile/banner')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: p2DiskStorage(),
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  uploadProfileBanner(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) throw new BadRequestException('파일이 없습니다.');
    assertTeacherImageUpload(file);
    return this.teacherService.setProfileBanner(user.id, file);
  }

  @Get('courses')
  myCourses(@CurrentUser() user: AuthUser) {
    return this.teacherService.listMyCourses(user.id);
  }

  @Post('courses')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCourseDto) {
    return this.teacherService.create(user.id, dto);
  }

  @Post('courses/:id/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: p2DiskStorage(),
      limits: { fileSize: 52 * 1024 * 1024 },
    }),
  )
  upload(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) throw new BadRequestException('파일이 없습니다.');
    assertVideoCourseUpload(file);
    return this.teacherService.confirmUpload(user.id, id, file);
  }

  @Put('courses/:id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.teacherService.update(user.id, id, dto);
  }

  @Delete('courses/:id')
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.teacherService.remove(user.id, id);
  }

  @Patch('profile')
  profile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.teacherService.updateProfile(user.id, dto);
  }
}
