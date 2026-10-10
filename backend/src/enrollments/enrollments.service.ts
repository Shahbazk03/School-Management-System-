import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    if (data.rollNumber) {
      const existing = await this.prisma.studentEnrollment.findFirst({
        where: {
          academicSessionId: data.academicSessionId,
          classSectionId: data.classSectionId,
          rollNumber: data.rollNumber,
        }
      });
      if (existing) {
        throw new Error(`Roll number ${data.rollNumber} is already assigned in this class and session.`);
      }
    }
    return this.prisma.studentEnrollment.create({ data });
  }

  async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.studentEnrollment.findMany({
      ...params,
      include: {
        student: true,
        academicSession: true,
        classSection: {
          include: {
            class: true,
            section: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async promote(data: {
    studentIds: string[];
    targetAcademicSessionId: string;
    targetClassSectionId: string;
  }) {
    const { studentIds, targetAcademicSessionId, targetClassSectionId } = data;
    const results = [];

    for (const studentId of studentIds) {
      const prevEnrollment = await this.prisma.studentEnrollment.findFirst({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
      });

      if (prevEnrollment && prevEnrollment.academicSessionId !== targetAcademicSessionId) {
        await this.prisma.studentEnrollment.update({
          where: { id: prevEnrollment.id },
          data: { admissionStatus: 'PROMOTED' },
        });
      }

      const enrollment = await this.prisma.studentEnrollment.upsert({
        where: {
          studentId_academicSessionId: {
            studentId,
            academicSessionId: targetAcademicSessionId,
          },
        },
        create: {
          studentId,
          academicSessionId: targetAcademicSessionId,
          classSectionId: targetClassSectionId,
          startDate: new Date(),
          admissionStatus: 'ENROLLED',
          promotedFromId: prevEnrollment ? prevEnrollment.id : null,
        },
        update: {
          classSectionId: targetClassSectionId,
          admissionStatus: 'ENROLLED',
          promotedFromId: prevEnrollment ? prevEnrollment.id : null,
        },
        include: {
          student: true,
        },
      });

      results.push(enrollment);
    }

    return {
      promotedCount: results.length,
      enrollments: results,
    };
  }

  async findOne(id: string) {
    return this.prisma.studentEnrollment.findUnique({
      where: { id },
      include: {
        student: true,
        academicSession: true,
        classSection: {
          include: {
            class: true,
            section: true,
          },
        },
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.studentEnrollment.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.studentEnrollment.delete({ where: { id } });
  }
}
