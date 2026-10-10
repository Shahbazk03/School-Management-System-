import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NoticesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.notice.create({ data });
  }

  async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.notice.findMany(params);
  }

  async findOne(id: string) {
    return this.prisma.notice.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.notice.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.notice.delete({ where: { id } });
  }
}
