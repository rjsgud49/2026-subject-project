import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('difficulty') difficulty?: string,
    @Query('min_price') min_price?: string,
    @Query('max_price') max_price?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('size') size?: string,
  ) {
    return this.coursesService.findAll({
      q,
      category,
      difficulty,
      min_price: min_price != null ? Number(min_price) : undefined,
      max_price: max_price != null ? Number(max_price) : undefined,
      sort,
      page: page != null ? Number(page) : undefined,
      size: size != null ? Number(size) : undefined,
    });
  }

  @Get(':courseId')
  findOne(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.coursesService.findOne(courseId);
  }
}
