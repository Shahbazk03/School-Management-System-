import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    try {
      return await this.prisma.class.create({ data });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('A class with this name already exists.');
      }
      throw error;
    }
  }

  async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.class.findMany({
      ...params,
      include: {
        classSections: {
          include: {
            section: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.class.findUnique({
      where: { id },
      include: {
        classSections: {
          include: {
            section: true,
          },
        },
      },
    });
  }

  async assignSection(classId: string, sectionId: string) {
    return this.prisma.classSection.upsert({
      where: {
        classId_sectionId: {
          classId,
          sectionId,
        },
      },
      create: {
        classId,
        sectionId,
      },
      update: {},
      include: {
        section: true,
      },
    });
  }

  async removeSection(classId: string, sectionId: string) {
    return this.prisma.classSection.deleteMany({
      where: {
        classId,
        sectionId,
      },
    });
  }

  async update(id: string, data: any) {
    try {
      return await this.prisma.class.update({ where: { id }, data });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('A class with this name already exists.');
      }
      throw error;
    }
  }

  async remove(id: string) {
    return this.prisma.class.delete({ where: { id } });
  }
}
