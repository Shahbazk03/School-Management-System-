import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class QuestionPapersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.questionPaper.create({ data });
  }

  async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.questionPaper.findMany(params);
  }

  async findOne(id: string) {
    return this.prisma.questionPaper.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.questionPaper.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.questionPaper.delete({ where: { id } });
  }
}
