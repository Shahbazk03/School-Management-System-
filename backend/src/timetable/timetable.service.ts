import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const TIMETABLE_INCLUDE = {
  subject: true,
  teacher: true,
  classSection: {
    include: {
      class: true,
      section: true,
    },
  },
  academicSession: true,
};

@Injectable()
export class TimetableService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    try {
      return await this.prisma.timetableEntry.create({ data, include: TIMETABLE_INCLUDE });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('A timetable entry already exists for this teacher or class in this period/day.');
      }
      throw error;
    }
  }

  async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.timetableEntry.findMany({
      ...params,
      include: TIMETABLE_INCLUDE,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findOne(id: string) {
    return this.prisma.timetableEntry.findUnique({ where: { id }, include: TIMETABLE_INCLUDE });
  }

  async update(id: string, data: any) {
    return this.prisma.timetableEntry.update({ where: { id }, data, include: TIMETABLE_INCLUDE });
  }

  async remove(id: string) {
    return this.prisma.timetableEntry.delete({ where: { id } });
  }
}
