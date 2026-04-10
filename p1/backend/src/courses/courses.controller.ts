import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CourseQueryDto } from './dto/course-query.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll(@Query() query: CourseQueryDto) {
    return this.coursesService.findAll({
      q: query.q,
      instructor_name: query.instructor_name,
      category: query.category,
      interviewType: query.interviewType,
      difficulty: query.difficulty,
      min_price: query.min_price != null ? Number(query.min_price) : undefined,
      max_price: query.max_price != null ? Number(query.max_price) : undefined,
      sort: query.sort,
      page: query.page != null ? Number(query.page) : undefined,
      size: query.size != null ? Number(query.size) : undefined,
    });
  }

  @Get(':courseId')
  findOne(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.coursesService.findOne(courseId);
  }
}
