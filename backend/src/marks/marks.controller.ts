import { Controller, Post, Body, Get, Param, UseGuards, Req, Query } from '@nestjs/common';
import { MarksService } from './marks.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard, Roles } from '../auth/roles.guard.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Marks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('marks')
export class MarksController {
  constructor(private readonly marksService: MarksService) {}

  @Roles('ADMIN', 'TEACHER')
  @Get()
  findAll(
    @Query('examId') examId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.marksService.findAll({ examId, subjectId, studentId });
  }

  @Roles('ADMIN', 'TEACHER')
  @Post()
  enterMarks(@Body() data: any, @Req() req: any) {
    return this.marksService.enterMarks({
      ...data,
      enteredById: req.user.sub,
      userRole: req.user.role
    });
  }

  @Roles('ADMIN', 'TEACHER', 'PARENT', 'STUDENT')
  @Get('student/:studentId/exam/:examId')
  getStudentMarks(@Param('studentId') studentId: string, @Param('examId') examId: string) {
    return this.marksService.getStudentMarks(studentId, examId);
  }
}
