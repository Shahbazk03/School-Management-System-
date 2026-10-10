import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.auditLog.create({ data });
  }

  async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.auditLog.findMany(params);
  }

  async findOne(id: string) {
    return this.prisma.auditLog.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.auditLog.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.auditLog.delete({ where: { id } });
  }
}
