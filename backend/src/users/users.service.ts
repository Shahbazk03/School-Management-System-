import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.user.create({ data });
  }

  async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.user.findMany({
      ...params,
      select: { id: true, loginId: true, role: true, status: true, email: true, mobile: true, createdAt: true, updatedAt: true }
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({ 
      where: { id },
      select: { id: true, loginId: true, role: true, status: true, email: true, mobile: true, createdAt: true, updatedAt: true }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async resetPassword(id: string) {
    const argon2 = await import('argon2');
    const newPassword = Math.random().toString(36).slice(-8) + 'X9$';
    const hash = await argon2.hash(newPassword);
    
    await this.prisma.user.update({
      where: { id },
      data: { password: hash }
    });
    
    return { newPassword };
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
