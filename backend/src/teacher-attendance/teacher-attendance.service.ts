import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TeacherAttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.teacherAttendance.create({ data });
  }

  async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.teacherAttendance.findMany({
      ...params,
      include: {
        teacher: true,
      },
    });
  }

  async markBulk(records: any[], markedById?: string) {
    const results = [];
    for (const rec of records) {
      const date = new Date(rec.date);
      const res = await this.prisma.teacherAttendance.upsert({
        where: {
          teacherId_date: {
            teacherId: rec.teacherId,
            date,
          },
        },
        create: {
          teacherId: rec.teacherId,
          date,
          status: rec.status || 'PRESENT',
          checkIn: rec.checkIn ? new Date(rec.checkIn) : null,
          checkOut: rec.checkOut ? new Date(rec.checkOut) : null,
          remarks: rec.remarks || null,
          markedById: markedById || 'SYSTEM',
        },
        update: {
          status: rec.status || 'PRESENT',
          checkIn: rec.checkIn ? new Date(rec.checkIn) : undefined,
          checkOut: rec.checkOut ? new Date(rec.checkOut) : undefined,
          remarks: rec.remarks || null,
          markedById: markedById || 'SYSTEM',
          markedAt: new Date(),
        },
      });
      results.push(res);
    }
    return results;
  }

  async findOne(id: string) {
    return this.prisma.teacherAttendance.findUnique({
      where: { id },
      include: { teacher: true },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.teacherAttendance.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.teacherAttendance.delete({ where: { id } });
  }
}
