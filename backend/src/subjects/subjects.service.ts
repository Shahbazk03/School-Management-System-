import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.subject.create({ data });
  }

  async bulkCreate(subjectsData: any[]) {
    const results = [];
    for (const data of subjectsData) {
      try {
        const result = await this.create(data);
        results.push({ success: true, data: result });
      } catch (error: any) {
        results.push({ success: false, subjectCode: data.subjectCode, error: error.message });
      }
    }
    return results;
  }

  async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.subject.findMany(params);
  }

  async findOne(id: string) {
    return this.prisma.subject.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.subject.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.subject.delete({ where: { id } });
  }
}
