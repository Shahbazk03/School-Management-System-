import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AcademicSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.academicSession.create({ data });
  }

  async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.academicSession.findMany(params);
  }

  async findOne(id: string) {
    return this.prisma.academicSession.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.academicSession.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.academicSession.delete({ where: { id } });
  }
}
