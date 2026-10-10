import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('enrollments')
@ApiBearerAuth()
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Post('promote')
  promote(@Body() data: { studentIds: string[]; targetAcademicSessionId: string; targetClassSectionId: string }) {
    return this.service.promote(data);
  }

  @Get()
  findAll(@Query() query: any) {
    const where: any = {};
    if (query.classSectionId) where.classSectionId = query.classSectionId;
    if (query.academicSessionId) where.academicSessionId = query.academicSessionId;
    if (query.studentId) where.studentId = query.studentId;

    return this.service.findAll({
      skip: query.skip ? +query.skip : undefined,
      take: query.take ? +query.take : undefined,
      where,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
