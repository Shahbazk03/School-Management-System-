import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.feedbackTicket.create({ data });
  }

  async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.feedbackTicket.findMany(params);
  }

  async findOne(id: string) {
    return this.prisma.feedbackTicket.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.feedbackTicket.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.feedbackTicket.delete({ where: { id } });
  }
}
