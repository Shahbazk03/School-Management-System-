import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AttendanceService } from './attendance.service.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  markAttendance(@Body() data: any, @Req() req: any) {
    return this.attendanceService.markAttendance({
      ...data,
      markedById: req.user.sub
    });
  }

  @Get('student/:studentId/cumulative')
  getStudentCumulativeAttendance(
    @Param('studentId') studentId: string,
    @Query('academicSessionId') academicSessionId: string
  ) {
    return this.attendanceService.getStudentCumulativeAttendance(studentId, academicSessionId);
  }

  @Get('student/:studentId/range')
  getStudentAttendanceByDateRange(
    @Param('studentId') studentId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.attendanceService.getStudentAttendanceByDateRange(
      studentId, 
      new Date(startDate), 
      new Date(endDate)
    );
  }

  @Get('class/:classSectionId')
  getClassAttendance(
    @Param('classSectionId') classSectionId: string,
    @Query('date') date: string
  ) {
    return this.attendanceService.getClassAttendance(classSectionId, new Date(date));
  }

  @Post('correction-request')
  requestCorrection(@Body() data: any, @Req() req: any) {
    return this.attendanceService.requestCorrection({
      ...data,
      requestedById: req.user.sub
    });
  }

  @Get('correction-requests')
  getCorrectionRequests(@Query('status') status?: string) {
    return this.attendanceService.getCorrectionRequests(status);
  }

  @Patch('correction-approve/:id')
  approveCorrection(@Param('id') id: string, @Req() req: any) {
    return this.attendanceService.approveCorrection(id, req.user.sub);
  }

  @Patch('correction-reject/:id')
  rejectCorrection(@Param('id') id: string, @Body('comment') comment: string, @Req() req: any) {
    return this.attendanceService.rejectCorrection(id, req.user.sub, comment);
  }
}
