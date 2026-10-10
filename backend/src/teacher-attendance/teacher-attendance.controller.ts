import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TeacherAttendanceService } from './teacher-attendance.service.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('teacher-attendance')
@ApiBearerAuth()
@Controller('teacher-attendance')
export class TeacherAttendanceController {
  constructor(private readonly service: TeacherAttendanceService) {}

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Post('bulk')
  markBulk(@Body() body: { records: any[]; markedById?: string }) {
    return this.service.markBulk(body.records, body.markedById);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll({
      skip: query.skip ? +query.skip : undefined,
      take: query.take ? +query.take : undefined,
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
