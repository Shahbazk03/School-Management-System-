import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.news.create({ data });
  }

  async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.news.findMany(params);
  }

  async findOne(id: string) {
    return this.prisma.news.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.news.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.news.delete({ where: { id } });
  }
}
