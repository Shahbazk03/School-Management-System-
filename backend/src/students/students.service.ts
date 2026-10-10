import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    // Generate secure passwords or use provided ones
    const argon2 = await import('argon2');
    const studentPassword = data.studentPassword || (Math.random().toString(36).slice(-8) + 'A1!');
    const parentPassword = data.parentPassword || (Math.random().toString(36).slice(-8) + 'B2@');
    
    const studentHash = await argon2.hash(studentPassword);
    const parentHash = await argon2.hash(parentPassword);
    
    // We assume the frontend passes everything structured.
    // If not, we will extract it here.
    return this.prisma.$transaction(async (tx) => {
      // 1. Create Student User
      const studentUser = await tx.user.create({
        data: {
          loginId: data.studentId,
          password: studentHash,
          role: 'STUDENT',
          schoolId: data.schoolId,
        }
      });
      
      // 2. Create Student
      const student = await tx.student.create({
        data: {
          permanentId: data.studentId,
          admissionNo: data.admissionNo,
          firstName: data.firstName,
          lastName: data.lastName,
          dob: new Date(data.dob),
          gender: data.gender,
          admissionDate: new Date(),
          schoolId: data.schoolId,
          userId: studentUser.id,
        }
      });
      
      // 3. Create Parent User & Parent
      let parentUser = null;
      let parent = null;
      
      if (data.parentLoginId) {
        parentUser = await tx.user.create({
          data: {
            loginId: data.parentLoginId,
            password: parentHash,
            role: 'PARENT',
            schoolId: data.schoolId,
          }
        });
        
        parent = await tx.parent.create({
          data: {
            parentId: data.parentLoginId,
            firstName: data.parentFirstName,
            lastName: data.parentLastName,
            phone: data.parentPhone,
            email: data.parentEmail,
            schoolId: data.schoolId,
            userId: parentUser.id,
          }
        });
        
        // Link Parent and Student
        await tx.parentStudent.create({
          data: {
            parentId: parent.id,
            studentId: student.id,
            relation: data.parentRelation || 'GUARDIAN'
          }
        });
      }
      
      // 4. Create Enrollment
      if (data.academicSessionId && data.classSectionId) {
        if (data.rollNumber) {
          const existing = await tx.studentEnrollment.findFirst({
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

        await tx.studentEnrollment.create({
          data: {
            studentId: student.id,
            academicSessionId: data.academicSessionId,
            classSectionId: data.classSectionId,
            startDate: new Date(),
            admissionStatus: 'ENROLLED',
            rollNumber: data.rollNumber || null
          }
        });
      }
      
      return {
        student,
        credentials: {
          student: { loginId: data.studentId, password: studentPassword },
          parent: parent ? { loginId: data.parentLoginId, password: parentPassword } : null
        }
      };
    });
  }

  async bulkCreate(studentsData: any[]) {
    const results = [];
    for (const data of studentsData) {
      try {
        const result = await this.create(data);
        results.push({ success: true, data: result });
      } catch (error: any) {
        results.push({ success: false, studentId: data.studentId, error: error.message });
      }
    }
    return results;
  }

  async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.student.findMany({
      ...params,
      include: {
        enrollments: {
          include: {
            classSection: { include: { class: true, section: true } },
            academicSession: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        parents: {
          include: { parent: true },
        },
      },
      orderBy: { firstName: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.student.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
            classSection: { include: { class: true, section: true } },
            academicSession: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        parents: {
          include: { parent: true },
        },
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.student.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.student.delete({ where: { id } });
  }

  async resetPassword(studentId: string, newPassword?: string) {
    if (!newPassword) throw new Error('New password must be provided by the admin');

    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new Error('Student not found');
    if (!student.userId) throw new Error('Student has no login account');

    const argon2 = await import('argon2');
    const hash = await argon2.hash(newPassword);

    await this.prisma.user.update({
      where: { id: student.userId },
      data: { password: hash }
    });

    return { success: true, password: newPassword };
  }
}

