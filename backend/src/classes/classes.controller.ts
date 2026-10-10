import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ClassesService } from './classes.service.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('classes')
@ApiBearerAuth()
@Controller('classes')
export class ClassesController {
  constructor(private readonly service: ClassesService) {}

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
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

  @Post(':id/sections')
  assignSection(@Param('id') classId: string, @Body('sectionId') sectionId: string) {
    return this.service.assignSection(classId, sectionId);
  }

  @Delete(':id/sections/:sectionId')
  removeSection(@Param('id') classId: string, @Param('sectionId') sectionId: string) {
    return this.service.removeSection(classId, sectionId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
