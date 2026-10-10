import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TeacherAssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(teacherId?: string) {
    const where = teacherId ? { teacherId } : {};
    const subjectAssignments = await this.prisma.teacherClassAssignment.findMany({
      where,
      include: {
        teacher: true,
        subject: true,
        classSection: {
          include: {
            class: true,
            section: true,
          }
        }
      }
    });

    let results: any[] = subjectAssignments.map(a => ({ ...a, isClassTeacher: false }));

    if (teacherId) {
      const classTeacherSections = await this.prisma.classSection.findMany({
        where: { classTeacherId: teacherId },
        include: {
          class: true,
          section: true,
          classTeacher: true,
        }
      });

      const classTeacherAssignments = classTeacherSections.map(cs => ({
        id: `ct-${cs.id}`,
        teacherId: teacherId,
        classSectionId: cs.id,
        subjectId: null,
        isClassTeacher: true,
        teacher: cs.classTeacher,
        subject: null,
        classSection: cs
      }));

      // Combine both. If a teacher is a class teacher, they might also have subject assignments in the same class.
      // To avoid duplicate cards for the exact same class if we only want one card, we can just return both.
      // The frontend will render multiple cards (one for class teacher, one for each subject).
      results = [...results, ...classTeacherAssignments];
    }

    return results;
  }

  async create(data: any) {
    // Check if the assignment already exists
    const existing = await this.prisma.teacherClassAssignment.findUnique({
      where: {
        teacherId_classSectionId_subjectId: {
          teacherId: data.teacherId,
          classSectionId: data.classSectionId,
          subjectId: data.subjectId
        }
      }
    });

    if (existing) {
      return existing;
    }

    return this.prisma.teacherClassAssignment.create({
      data: {
        teacherId: data.teacherId,
        classSectionId: data.classSectionId,
        subjectId: data.subjectId
      },
      include: {
        teacher: true,
        subject: true,
        classSection: {
          include: {
            class: true,
            section: true,
          }
        }
      }
    });
  }

  async remove(id: string) {
    return this.prisma.teacherClassAssignment.delete({ where: { id } });
  }
}
