import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async markAttendance(data: {
    studentId: string;
    academicSessionId: string;
    enrollmentId?: string;
    classSectionId: string;
    date: Date;
    status: any;
    remarks?: string;
    markedById: string;
  }) {
    const date = new Date(data.date);
    let enrollmentId = data.enrollmentId;
    if (!enrollmentId) {
      const enrollment = await this.prisma.studentEnrollment.findFirst({
        where: { studentId: data.studentId, academicSessionId: data.academicSessionId },
      });
      if (enrollment) {
        enrollmentId = enrollment.id;
      }
    }

    if (!enrollmentId) {
      // Fallback: look for any enrollment for this student
      const anyEnrollment = await this.prisma.studentEnrollment.findFirst({
        where: { studentId: data.studentId },
      });
      if (anyEnrollment) enrollmentId = anyEnrollment.id;
    }

    return this.prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId: data.studentId,
          date,
        },
      },
      create: {
        studentId: data.studentId,
        academicSessionId: data.academicSessionId,
        enrollmentId: enrollmentId || '',
        classSectionId: data.classSectionId,
        date,
        status: data.status,
        remarks: data.remarks,
        markedById: data.markedById,
      },
      update: {
        status: data.status,
        remarks: data.remarks,
        markedById: data.markedById,
        markedAt: new Date(),
      },
    });
  }

  async getStudentAttendanceByDateRange(studentId: string, startDate: Date, endDate: Date) {
    return this.prisma.attendance.findMany({
      where: {
        studentId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    });
  }

  async getStudentCumulativeAttendance(studentId: string, academicSessionId: string) {
    const records = await this.prisma.attendance.findMany({
      where: { studentId, academicSessionId }
    });

    let total = records.length;
    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;
    let halfDay = 0;

    for (const r of records) {
      if (r.status === 'PRESENT') present++;
      if (r.status === 'ABSENT') absent++;
      if (r.status === 'LATE') late++;
      if (r.status === 'LEAVE') leave++;
      if (r.status === 'HALF_DAY') halfDay++;
    }

    // Typical rule: Late and HalfDay might count as 0.5 or 1 present, configurable
    // We'll count PRESENT as 1, LATE as 1, HALF_DAY as 0.5
    const presentEquivalent = present + late + (halfDay * 0.5);
    const percentage = total > 0 ? (presentEquivalent / total) * 100 : 0;

    return {
      total,
      present,
      absent,
      late,
      leave,
      halfDay,
      percentage: Number(percentage.toFixed(2))
    };
  }

  async getClassAttendance(classSectionId: string, date: Date) {
    return this.prisma.attendance.findMany({
      where: { classSectionId, date: new Date(date) },
      include: { student: true }
    });
  }

  async requestCorrection(data: {
    attendanceId: string;
    requestedById: string;
    requestedStatus: any;
    reason: string;
  }) {
    const attendance = await this.prisma.attendance.findUnique({ where: { id: data.attendanceId }});
    if (!attendance) throw new NotFoundException('Attendance record not found');

    return this.prisma.attendanceCorrectionRequest.create({
      data: {
        attendanceId: data.attendanceId,
        requestedById: data.requestedById,
        oldStatus: attendance.status,
        requestedStatus: data.requestedStatus,
        reason: data.reason
      }
    });
  }

  async approveCorrection(correctionId: string, reviewedById: string) {
    return this.prisma.$transaction(async (tx) => {
      const correction = await tx.attendanceCorrectionRequest.findUnique({ where: { id: correctionId }});
      if (!correction) throw new NotFoundException('Correction request not found');
      if (correction.status !== 'PENDING') throw new BadRequestException('Request is already processed');

      await tx.attendanceCorrectionRequest.update({
        where: { id: correctionId },
        data: {
          status: 'APPROVED',
          reviewedById,
          reviewedAt: new Date()
        }
      });

      await tx.attendance.update({
        where: { id: correction.attendanceId },
        data: {
          status: correction.requestedStatus,
          updatedAt: new Date()
        }
      });

      await tx.auditLog.create({
        data: {
          action: 'ATTENDANCE_CORRECTION_APPROVED',
          entity: 'Attendance',
          entityId: correction.attendanceId,
          userId: reviewedById,
          previousValue: { status: correction.oldStatus },
          newValue: { status: correction.requestedStatus }
        }
      });

      return { success: true };
    });
  }

  async rejectCorrection(correctionId: string, reviewedById: string, comment?: string) {
    const correction = await this.prisma.attendanceCorrectionRequest.findUnique({ where: { id: correctionId } });
    if (!correction) throw new NotFoundException('Correction request not found');
    if (correction.status !== 'PENDING') throw new BadRequestException('Request is already processed');

    return this.prisma.attendanceCorrectionRequest.update({
      where: { id: correctionId },
      data: {
        status: 'REJECTED',
        reviewedById,
        reviewedAt: new Date(),
        reviewComment: comment,
      },
    });
  }

  async getCorrectionRequests(status?: string) {
    return this.prisma.attendanceCorrectionRequest.findMany({
      where: status ? { status } : undefined,
      include: {
        attendance: {
          include: {
            student: true,
            classSection: {
              include: { class: true, section: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
