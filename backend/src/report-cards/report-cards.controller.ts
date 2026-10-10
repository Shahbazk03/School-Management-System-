import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ReportCardsService } from './report-cards.service.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('report-cards')
@ApiBearerAuth()
@Controller('report-cards')
export class ReportCardsController {
  constructor(private readonly service: ReportCardsService) {}

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Get('settings')
  getSettings() {
    return this.service.getSettings();
  }

  @Post('settings')
  updateSettings(@Body() data: any) {
    return this.service.updateSettings(data);
  }

  @Post('generate')
  generate(@Body() data: any) {
    return this.service.generate(data.studentId, data.examId, data.academicSessionId);
  }

  @Post('pdf')
  async generatePdf(@Body() data: any, @Res() res: Response) {
    const pdfBuffer = await this.service.generatePdf(data.reportCardId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="report_card.pdf"',
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
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
