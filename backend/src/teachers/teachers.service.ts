import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    const argon2 = await import('argon2');
    const tempPassword = Math.random().toString(36).slice(-8) + 'T3#';
    const hash = await argon2.hash(tempPassword);

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Teacher User
      const user = await tx.user.create({
        data: {
          loginId: data.teacherId,
          password: hash,
          role: 'TEACHER',
          schoolId: data.schoolId,
        }
      });
      
      // 2. Create Teacher
      const teacher = await tx.teacher.create({
        data: {
          teacherId: data.teacherId,
          employeeId: data.employeeId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          mobile: data.mobile,
          qualification: data.qualifications,
          joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
          department: data.department,
          schoolId: data.schoolId,
          userId: user.id,
        }
      });
      
      return {
        teacher,
        credentials: {
          loginId: data.teacherId,
          password: tempPassword
        }
      };
    });
  }

  async bulkCreate(teachersData: any[]) {
    const results = [];
    for (const data of teachersData) {
      try {
        const result = await this.create(data);
        results.push({ success: true, data: result });
      } catch (error: any) {
        results.push({ success: false, teacherId: data.teacherId, error: error.message });
      }
    }
    return results;
  }

  async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.teacher.findMany({
      ...params,
      include: {
        classSections: {
          include: {
            class: true,
            section: true
          }
        }
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.teacher.findUnique({ 
      where: { id },
      include: {
        classSections: {
          include: {
            class: true,
            section: true
          }
        }
      }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.teacher.update({ where: { id }, data });
  }

  async resetPassword(teacherId: string, newPassword?: string) {
    if (!newPassword) throw new Error('New password must be provided by the admin');

    const teacher = await this.prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher) throw new Error('Teacher not found');
    if (!teacher.userId) throw new Error('Teacher has no login account');

    const argon2 = await import('argon2');
    const hash = await argon2.hash(newPassword);

    await this.prisma.user.update({
      where: { id: teacher.userId },
      data: { password: hash }
    });

    return { success: true, password: newPassword };
  }

  async remove(id: string) {
    return this.prisma.teacher.delete({ where: { id } });
  }

  async assignClassTeacher(teacherId: string, classSectionId: string) {
    const classSection = await this.prisma.classSection.findUnique({
      where: { id: classSectionId },
      include: { classTeacher: true }
    });

    if (!classSection) {
      throw new Error('Class section not found');
    }

    if (classSection.classTeacherId && classSection.classTeacherId !== teacherId) {
      const teacherName = `${classSection.classTeacher?.firstName} ${classSection.classTeacher?.lastName || ''}`.trim();
      throw new BadRequestException(`This class is already alloted to teacher ${teacherName}`);
    }

    return this.prisma.classSection.update({
      where: { id: classSectionId },
      data: { classTeacherId: teacherId }
    });
  }
}
