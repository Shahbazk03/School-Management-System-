import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class MarksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { examId?: string; subjectId?: string; studentId?: string }) {
    const where: any = {};
    if (params.studentId) where.studentId = params.studentId;
    
    if (params.examId || params.subjectId) {
      where.examSubject = {};
      if (params.examId) where.examSubject.examId = params.examId;
      if (params.subjectId) where.examSubject.subjectId = params.subjectId;
    }

    return this.prisma.mark.findMany({
      where,
      include: { subject: true, examSubject: true }
    });
  }

  async enterMarks(data: {
    studentId: string;
    examId: string;
    subjectId: string;
    theoryMarks: number;
    practicalMarks?: number;
    remarks?: string;
    enteredById: string;
    userRole: string;
  }) {
    // 1. Get or Create Exam Subject
    let examSubject = await this.prisma.examSubject.findUnique({
      where: {
        examId_subjectId: {
          examId: data.examId,
          subjectId: data.subjectId
        }
      },
      include: { subject: true, exam: true }
    });

    if (!examSubject) {
      // Auto-create if it doesn't exist to simplify frontend
      const subject = await this.prisma.subject.findUnique({ where: { id: data.subjectId } });
      if (!subject) throw new NotFoundException('Subject not found');

      examSubject = await this.prisma.examSubject.create({
        data: {
          examId: data.examId,
          subjectId: data.subjectId,
          examDate: new Date(),
          examTime: 'TBD'
        },
        include: { subject: true, exam: true }
      });
    }

    // 2. Validate Marks
    if (data.theoryMarks > examSubject.subject.theoryMarks) {
      throw new BadRequestException(`Marks cannot exceed maximum theory marks (${examSubject.subject.theoryMarks})`);
    }
    if (data.practicalMarks !== undefined && data.practicalMarks > examSubject.subject.practicalMarks) {
      throw new BadRequestException(`Practical marks cannot exceed maximum practical marks (${examSubject.subject.practicalMarks})`);
    }

    // 3. Verify Teacher Assignment if role is TEACHER
    if (data.userRole === 'TEACHER') {
      const enrollment = await this.prisma.studentEnrollment.findFirst({
        where: { studentId: data.studentId, academicSessionId: examSubject.exam.academicSessionId },
        orderBy: { createdAt: 'desc' }
      });

      if (!enrollment) {
        throw new BadRequestException('Student is not enrolled in the academic session of this exam');
      }

      const assignment = await this.prisma.teacherClassAssignment.findFirst({
        where: {
          teacher: { userId: data.enteredById },
          classSectionId: enrollment.classSectionId,
          subjectId: examSubject.subjectId
        }
      });

      if (!assignment) {
        throw new ForbiddenException('You are not authorized to enter marks for this class and subject');
      }
    }

    // Calculate Grade
    const totalMax = examSubject.subject.theoryMarks + examSubject.subject.practicalMarks;
    const totalObtained = data.theoryMarks + (data.practicalMarks || 0);
    const percentage = (totalObtained / totalMax) * 100;
    
    let grade = 'F';
    if (percentage >= 90) grade = 'A1';
    else if (percentage >= 80) grade = 'A2';
    else if (percentage >= 70) grade = 'B1';
    else if (percentage >= 60) grade = 'B2';
    else if (percentage >= 50) grade = 'C1';
    else if (percentage >= 40) grade = 'C2';
    else if (percentage >= 33) grade = 'D';

    // 4. Save Marks
    return this.prisma.mark.upsert({
      where: {
        studentId_examSubjectId: {
          studentId: data.studentId,
          examSubjectId: examSubject.id
        }
      },
      update: {
        marksObtained: data.theoryMarks,
        practicalMarksObtained: data.practicalMarks,
        grade,
        remarks: data.remarks,
        updatedById: data.enteredById
      },
      create: {
        studentId: data.studentId,
        examSubjectId: examSubject.id,
        subjectId: examSubject.subjectId,
        marksObtained: data.theoryMarks,
        practicalMarksObtained: data.practicalMarks,
        grade,
        remarks: data.remarks,
        enteredById: data.enteredById
      }
    });
  }

  async getStudentMarks(studentId: string, examId: string) {
    return this.prisma.mark.findMany({
      where: {
        studentId,
        examSubject: { examId }
      },
      include: { subject: true }
    });
  }
}
