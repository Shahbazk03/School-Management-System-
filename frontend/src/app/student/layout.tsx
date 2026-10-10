'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { User, Calendar, BookOpen, Clock, Award, FileText, Bell } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { redirect } from 'next/navigation';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  
  if (!user || user.role !== 'STUDENT') {
    redirect('/login');
  }

  const menuItems = [
    { label: 'Home', href: '/student', icon: User, group: 'MAIN' },
    { label: 'Attendance', href: '/student/attendance', icon: Calendar, group: 'ACADEMICS' },
    { label: 'Timetable', href: '/student/timetable', icon: Clock, group: 'ACADEMICS' },
    { label: 'Examinations', href: '/student/exams', icon: BookOpen, group: 'ACADEMICS' },
    { label: 'Report Cards', href: '/student/report-cards', icon: FileText, group: 'ACADEMICS' },
    { label: 'Question Papers', href: '/student/question-papers', icon: FileText, group: 'ACADEMICS' },
    { label: 'News & Notices', href: '/student/notices', icon: Bell, group: 'SCHOOL' },
    { label: 'Achievements', href: '/student/achievements', icon: Award, group: 'SCHOOL' },
    { label: 'Feedback', href: '/student/feedback', icon: FileText, group: 'SCHOOL' },
    { label: 'My Profile', href: '/student/profile', icon: User, group: 'ACCOUNT' },
  ];

  return <DashboardLayout menuItems={menuItems}>{children}</DashboardLayout>;
}
