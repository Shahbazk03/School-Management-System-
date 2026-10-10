import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SchoolsService } from './schools.service.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('schools')
@ApiBearerAuth()
@Controller('schools')
export class SchoolsController {
  constructor(private readonly service: SchoolsService) {}

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

  @Get('settings')
  async getSettings() {
    const schools = await this.service.findAll({ take: 1 });
    return schools[0] || null;
  }

  @Patch('settings')
  async updateSettings(@Body() data: any) {
    const schools = await this.service.findAll({ take: 1 });
    if (!schools.length) throw new Error("No school found");
    return this.service.update(schools[0].id, data);
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
