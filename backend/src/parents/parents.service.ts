import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ParentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.parent.create({ data });
  }

  async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.parent.findMany({
      ...params,
      include: {
        children: {
          include: {
            student: {
              include: {
                enrollments: {
                  include: {
                    academicSession: true,
                    classSection: {
                      include: {
                        class: true,
                        section: true
                      }
                    }
                  }
                }
              }
            }
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.parent.findUnique({
      where: { id },
      include: {
        children: {
          include: {
            student: {
              include: {
                enrollments: {
                  include: {
                    academicSession: true,
                    classSection: {
                      include: {
                        class: true,
                        section: true
                      }
                    }
                  }
                }
              }
            }
          },
        },
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.parent.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.parent.delete({ where: { id } });
  }
}
