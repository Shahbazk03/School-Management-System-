import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as puppeteer from 'puppeteer';
// @ts-ignore
import * as ejs from 'ejs';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

@Injectable()
export class ReportCardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.reportCard.create({ data });
  }

  async getSettings() {
    let settings = await this.prisma.reportCardSetting.findFirst();
    if (!settings) {
      settings = await this.prisma.reportCardSetting.create({
        data: {}
      });
    }
    return settings;
  }

  async updateSettings(data: any) {
    const settings = await this.getSettings();
    return this.prisma.reportCardSetting.update({
      where: { id: settings.id },
      data
    });
  }

  async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.reportCard.findMany(params);
  }

  async findOne(id: string) {
    return this.prisma.reportCard.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.reportCard.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.reportCard.delete({ where: { id } });
  }

  async generate(studentId: string, examId: string, academicSessionId: string) {
    // 1. Fetch all marks for this student and exam
    const marks = await this.prisma.mark.findMany({
      where: {
        studentId,
        examSubject: { examId }
      },
      include: { subject: true }
    });

    if (marks.length === 0) {
      throw new Error('No marks found for this student in the specified exam.');
    }

    let totalObtained = 0;
    let totalMax = 0;
    let hasFailed = false;

    for (const mark of marks) {
      const theoryObtained = mark.marksObtained || 0;
      const practicalObtained = mark.practicalMarksObtained || 0;
      const subjectTotal = theoryObtained + practicalObtained;
      
      totalObtained += subjectTotal;
      totalMax += (mark.subject.theoryMarks + mark.subject.practicalMarks);

      // Simple pass/fail logic
      if (subjectTotal < mark.subject.passingMarks) {
        hasFailed = true;
      }
    }

    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    
    let grade = 'F';
    if (percentage >= 90) grade = 'A1';
    else if (percentage >= 80) grade = 'A2';
    else if (percentage >= 70) grade = 'B1';
    else if (percentage >= 60) grade = 'B2';
    else if (percentage >= 50) grade = 'C1';
    else if (percentage >= 40) grade = 'C2';
    else if (percentage >= 33) grade = 'D';

    const result = hasFailed ? 'FAIL' : 'PASS';

    return this.prisma.reportCard.upsert({
      where: {
        studentId_examId: {
          studentId,
          examId
        }
      },
      update: {
        totalMarks: totalObtained,
        percentage,
        grade,
        result,
        academicSessionId
      },
      create: {
        studentId,
        examId,
        academicSessionId,
        totalMarks: totalObtained,
        percentage,
        grade,
        result
      }
    });
  }

  async generatePdf(reportCardId: string): Promise<Buffer> {
    const reportCard = await this.prisma.reportCard.findUnique({
      where: { id: reportCardId },
      include: {
        student: { include: { parents: { include: { parent: true } } } },
        exam: true,
        academicSession: true,
      }
    });

    if (!reportCard) throw new NotFoundException('Report Card not found');

    const marks = await this.prisma.mark.findMany({
      where: {
        studentId: reportCard.studentId,
        examSubject: { examId: reportCard.examId }
      },
      include: { subject: true }
    });
    
    // Sort marks by subject orderPreference
    marks.sort((a, b) => {
      const pA = (a.subject as any).orderPreference ?? 100;
      const pB = (b.subject as any).orderPreference ?? 100;
      return pA - pB;
    });

    const enrollment = await this.prisma.studentEnrollment.findFirst({
      where: { studentId: reportCard.studentId, academicSessionId: reportCard.academicSessionId },
      include: { classSection: { include: { class: true, section: true } } }
    });

    const settings = await this.getSettings();

    let templatePath = path.join(__dirname, 'templates', 'asha-modern.ejs');
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(process.cwd(), 'src', 'report-cards', 'templates', 'asha-modern.ejs');
    }
    
    try {
      const html = await ejs.renderFile(templatePath, {
        reportCard,
        student: reportCard.student,
        exam: reportCard.exam,
        academicSession: reportCard.academicSession,
        enrollment,
        marks,
        settings
      });

      const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
      });
      await browser.close();

      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw error;
    }
  }
}
