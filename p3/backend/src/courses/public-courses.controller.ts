import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CoursePublicService } from './course-public.service';

@Controller('courses')
export class PublicCoursesController {
  constructor(private readonly coursePublic: CoursePublicService) {}

  @Get()
  list(@Query('page') page?: string, @Query('size') size?: string) {
    return this.coursePublic.listPublished(
      parseInt(page ?? '1', 10) || 1,
      parseInt(size ?? '12', 10) || 12,
    );
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursePublic.getPublished(id);
  }
}
