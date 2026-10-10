import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TeachersService } from './teachers.service.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('teachers')
@ApiBearerAuth()
@Controller('teachers')
export class TeachersController {
  constructor(private readonly service: TeachersService) {}

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Post('bulk')
  bulkCreate(@Body() data: any[]) {
    return this.service.bulkCreate(data);
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

  @Post(':id/reset-password')
  resetPassword(@Param('id') id: string, @Body() data: { newPassword?: string }) {
    return this.service.resetPassword(id, data.newPassword);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/assign-class/:classSectionId')
  assignClassTeacher(@Param('id') id: string, @Param('classSectionId') classSectionId: string) {
    return this.service.assignClassTeacher(id, classSectionId);
  }
}
