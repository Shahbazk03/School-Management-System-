import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.section.create({ data });
  }

  async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.section.findMany(params);
  }

  async findOne(id: string) {
    return this.prisma.section.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.section.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.section.delete({ where: { id } });
  }
}
