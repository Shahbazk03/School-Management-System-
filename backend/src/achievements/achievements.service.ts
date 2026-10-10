import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.achievement.create({ data });
  }

  async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.achievement.findMany(params);
  }

  async findOne(id: string) {
    return this.prisma.achievement.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.achievement.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.achievement.delete({ where: { id } });
  }
}
