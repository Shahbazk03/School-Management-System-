import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SubjectsService } from './subjects.service.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('subjects')
@ApiBearerAuth()
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly service: SubjectsService) {}

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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
