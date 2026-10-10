import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TeacherAssignmentService } from './teacher-assignment.service.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@ApiTags('Teacher Assignment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teacher-assignment')
export class TeacherAssignmentController {
  constructor(private readonly service: TeacherAssignmentService) {}

  @Get()
  findAll(@Query('teacherId') teacherId?: string) {
    return this.service.findAll(teacherId);
  }

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
