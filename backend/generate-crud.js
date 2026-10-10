import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const models = {
  schools: 'school',
  'academic-sessions': 'academicSession',
  classes: 'class',
  sections: 'section',
  subjects: 'subject',
  users: 'user',
  students: 'student',
  parents: 'parent',
  teachers: 'teacher',
  enrollments: 'studentEnrollment',
  attendance: 'attendance',
  'teacher-attendance': 'teacherAttendance',
  timetable: 'timetableEntry',
  exams: 'exam',
  marks: 'mark',
  'report-cards': 'reportCard',
  news: 'news',
  notices: 'notice',
  'question-papers': 'questionPaper',
  achievements: 'achievement',
  feedback: 'feedbackTicket',
  'audit-logs': 'auditLog'
};

const srcDir = path.join(__dirname, 'src');

for (const [moduleName, prismaModel] of Object.entries(models)) {
  const serviceFile = path.join(srcDir, moduleName, `${moduleName}.service.ts`);
  const controllerFile = path.join(srcDir, moduleName, `${moduleName}.controller.ts`);
  
  const className = moduleName.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');

  if (fs.existsSync(serviceFile)) {
    const serviceContent = `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ${className}Service {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.${prismaModel}.create({ data });
  }

  async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.${prismaModel}.findMany(params);
  }

  async findOne(id: string) {
    return this.prisma.${prismaModel}.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.${prismaModel}.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.${prismaModel}.delete({ where: { id } });
  }
}
`;
    fs.writeFileSync(serviceFile, serviceContent);
  }

  if (fs.existsSync(controllerFile)) {
    const controllerContent = `import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ${className}Service } from './${moduleName}.service.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('${moduleName}')
@ApiBearerAuth()
@Controller('${moduleName}')
export class ${className}Controller {
  constructor(private readonly service: ${className}Service) {}

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll({
      skip: query.skip ? +query.skip : undefined,
      take: query.take ? +query.take : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
`;
    fs.writeFileSync(controllerFile, controllerContent);
  }
}

console.log('Basic CRUD generated successfully!');
