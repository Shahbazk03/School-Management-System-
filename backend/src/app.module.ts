import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { SchoolsModule } from './schools/schools.module.js';
import { AcademicSessionsModule } from './academic-sessions/academic-sessions.module.js';
import { StudentsModule } from './students/students.module.js';
import { ParentsModule } from './parents/parents.module.js';
import { TeachersModule } from './teachers/teachers.module.js';
import { ClassesModule } from './classes/classes.module.js';
import { SectionsModule } from './sections/sections.module.js';
import { SubjectsModule } from './subjects/subjects.module.js';
import { EnrollmentsModule } from './enrollments/enrollments.module.js';
import { AttendanceModule } from './attendance/attendance.module.js';
import { TeacherAttendanceModule } from './teacher-attendance/teacher-attendance.module.js';
import { TimetableModule } from './timetable/timetable.module.js';
import { ExamsModule } from './exams/exams.module.js';
import { MarksModule } from './marks/marks.module.js';
import { ReportCardsModule } from './report-cards/report-cards.module.js';
import { NewsModule } from './news/news.module.js';
import { NoticesModule } from './notices/notices.module.js';
import { QuestionPapersModule } from './question-papers/question-papers.module.js';
import { AchievementsModule } from './achievements/achievements.module.js';
import { FeedbackModule } from './feedback/feedback.module.js';
import { AuditLogsModule } from './audit-logs/audit-logs.module.js';
import { HealthModule } from './health/health.module.js';
import { TeacherAssignmentModule } from './teacher-assignment/teacher-assignment.module.js';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, SchoolsModule, AcademicSessionsModule, StudentsModule, ParentsModule, TeachersModule, ClassesModule, SectionsModule, SubjectsModule, EnrollmentsModule, AttendanceModule, TeacherAttendanceModule, TimetableModule, ExamsModule, MarksModule, ReportCardsModule, NewsModule, NoticesModule, QuestionPapersModule, AchievementsModule, FeedbackModule, AuditLogsModule, HealthModule, TeacherAssignmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
