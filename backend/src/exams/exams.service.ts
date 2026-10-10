import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const EXAM_INCLUDE = {
  academicSession: true,
  examSubjects: {
    include: {
      subject: true,
    },
  },
};

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.exam.create({ data, include: EXAM_INCLUDE });
  }

  async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.exam.findMany({
      ...params,
      include: EXAM_INCLUDE,
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.exam.findUnique({ where: { id }, include: EXAM_INCLUDE });
  }

  async update(id: string, data: any) {
    return this.prisma.exam.update({ where: { id }, data, include: EXAM_INCLUDE });
  }

  async remove(id: string) {
    return this.prisma.exam.delete({ where: { id } });
  }
}
