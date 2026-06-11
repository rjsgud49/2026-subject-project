import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CoursePublicService } from './course-public.service';

@Controller('courses')
export class PublicCoursesController {
  constructor(private readonly coursePublic: CoursePublicService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Query('q') q?: string,
    @Query('instructor_name') instructor_name?: string,
    @Query('category') category?: string,
    @Query('interviewType') interviewType?: string,
    @Query('difficulty') difficulty?: string,
    @Query('min_price') min_price?: string,
    @Query('max_price') max_price?: string,
    @Query('sort') sort?: string,
  ) {
    return this.coursePublic.listPublished({
      page: parseInt(page ?? '1', 10) || 1,
      size: parseInt(size ?? '12', 10) || 12,
      q,
      instructor_name,
      category,
      interviewType,
      difficulty,
      min_price:
        min_price != null && min_price !== ''
          ? Number(min_price)
          : undefined,
      max_price:
        max_price != null && max_price !== ''
          ? Number(max_price)
          : undefined,
      sort,
    });
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursePublic.getPublished(id);
  }
}
