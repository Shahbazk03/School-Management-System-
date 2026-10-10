import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SchoolsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.school.create({ data });
  }

  async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.school.findMany(params);
  }

  async findOne(id: string) {
    return this.prisma.school.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.school.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.school.delete({ where: { id } });
  }
}
