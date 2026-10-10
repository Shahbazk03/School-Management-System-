import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const { Pool } = pg;
import * as argon2 from 'argon2';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');
  
  const defaultPassword = await argon2.hash('password123');

  // 1. Create School
  const school = await prisma.school.create({
    data: {
      schoolCode: 'DEMO-001',
      schoolName: 'Demo International School',
      address: '123 Education Lane',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      principalName: 'Dr. A. Sharma'
    }
  });

  // 2. Create Users (Admin, Teacher, Parent, Student)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.local',
      loginId: 'ADMIN-001',
      password: defaultPassword,
      role: 'ADMIN',
      schoolId: school.id
    }
  });

  const teacherUser = await prisma.user.create({
    data: {
      email: 'teacher@demo.local',
      loginId: 'TEACHER-001',
      password: defaultPassword,
      role: 'TEACHER',
      schoolId: school.id
    }
  });

  const parentUser = await prisma.user.create({
    data: {
      email: 'parent@demo.local',
      loginId: 'PARENT-001',
      password: defaultPassword,
      role: 'PARENT',
      schoolId: school.id
    }
  });

  const studentUser = await prisma.user.create({
    data: {
      email: 'student@demo.local',
      loginId: 'STUDENT-001',
      password: defaultPassword,
      role: 'STUDENT',
      schoolId: school.id
    }
  });

  // 3. Create Academic Sessions
  const s24_25 = await prisma.academicSession.create({
    data: { name: '2024-25', startDate: new Date('2024-04-01'), endDate: new Date('2025-03-31'), schoolId: school.id }
  });
  const s25_26 = await prisma.academicSession.create({
    data: { name: '2025-26', startDate: new Date('2025-04-01'), endDate: new Date('2026-03-31'), schoolId: school.id }
  });
  const s26_27 = await prisma.academicSession.create({
    data: { name: '2026-27', startDate: new Date('2026-04-01'), endDate: new Date('2027-03-31'), isCurrent: true, schoolId: school.id }
  });

  // 4. Create Classes & Sections
  const classes = [];
  for (let i = 1; i <= 12; i++) {
    classes.push(await prisma.class.create({ data: { name: i.toString(), order: i, schoolId: school.id } }));
  }
  
  const secA = await prisma.section.create({ data: { name: 'A', schoolId: school.id } });
  const secB = await prisma.section.create({ data: { name: 'B', schoolId: school.id } });

  // ClassSections
  const classSections = {};
  for (const cls of classes) {
    const csA = await prisma.classSection.create({ data: { classId: cls.id, sectionId: secA.id } });
    const csB = await prisma.classSection.create({ data: { classId: cls.id, sectionId: secB.id } });
    classSections[`${cls.name}-A`] = csA;
    classSections[`${cls.name}-B`] = csB;
  }

  // 5. Create Teacher
  const teacher = await prisma.teacher.create({
    data: {
      teacherId: 'TEACH-2026-000045',
      employeeId: 'EMP-045',
      firstName: 'Anita',
      lastName: 'Desai',
      joiningDate: new Date('2020-05-10'),
      userId: teacherUser.id,
      schoolId: school.id
    }
  });

  // 6. Create Parent
  const parent = await prisma.parent.create({
    data: {
      parentId: 'PARENT-2026-000123',
      firstName: 'Ramesh',
      lastName: 'Sharma',
      userId: parentUser.id,
      schoolId: school.id
    }
  });

  // 7. Create Rahul Sharma (Student)
  const rahul = await prisma.student.create({
    data: {
      permanentId: 'STU-2026-001245',
      admissionNo: 'ADM-1245',
      firstName: 'Rahul',
      lastName: 'Sharma',
      dob: new Date('2012-08-15'),
      gender: 'Male',
      admissionDate: new Date('2020-04-01'),
      userId: studentUser.id,
      schoolId: school.id
    }
  });

  await prisma.parentStudent.create({
    data: { parentId: parent.id, studentId: rahul.id, relation: 'FATHER' }
  });

  // Enroll Rahul
  // 24-25 Class 6-A
  const er24 = await prisma.studentEnrollment.create({
    data: {
      studentId: rahul.id,
      academicSessionId: s24_25.id,
      classSectionId: classSections['6-A'].id,
      rollNumber: '25',
      startDate: new Date('2024-04-01')
    }
  });

  // 25-26 Class 7-B
  const er25 = await prisma.studentEnrollment.create({
    data: {
      studentId: rahul.id,
      academicSessionId: s25_26.id,
      classSectionId: classSections['7-B'].id,
      rollNumber: '25',
      startDate: new Date('2025-04-01'),
      promotedFromId: er24.id
    }
  });
  
  // Update previous enrollment promotedTo
  await prisma.studentEnrollment.update({ where: { id: er24.id }, data: { promotedToId: er25.id } });

  // 26-27 Class 8-A
  const er26 = await prisma.studentEnrollment.create({
    data: {
      studentId: rahul.id,
      academicSessionId: s26_27.id,
      classSectionId: classSections['8-A'].id,
      rollNumber: '24',
      startDate: new Date('2026-04-01'),
      promotedFromId: er25.id
    }
  });

  await prisma.studentEnrollment.update({ where: { id: er25.id }, data: { promotedToId: er26.id } });

  // Create fake attendance for Rahul to match percentages
  // To avoid creating hundreds of records, we will create a few specific records
  // We'll just create the required dummy records for testing.
  
  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
