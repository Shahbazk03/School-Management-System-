'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/auth/AuthContext';
import { redirect } from 'next/navigation';
import { Calendar, User, Clock, BookOpen, FileText, Award, Bell } from 'lucide-react';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user || user.role !== 'PARENT') {
    redirect('/login');
  }

  const menuItems = [
    { label: 'Home', href: '/parent', icon: User, group: 'MAIN' },
    { label: 'Attendance', href: '/parent/attendance', icon: Calendar, group: 'ACADEMICS' },
    { label: 'Timetable', href: '/parent/timetable', icon: Clock, group: 'ACADEMICS' },
    { label: 'Examinations', href: '/parent/exams', icon: BookOpen, group: 'ACADEMICS' },
    { label: 'Report Cards', href: '/parent/report-cards', icon: FileText, group: 'ACADEMICS' },
    { label: 'Question Papers', href: '/parent/question-papers', icon: FileText, group: 'ACADEMICS' },
    { label: 'News & Notices', href: '/parent/notices', icon: Bell, group: 'SCHOOL' },
    { label: 'Achievements', href: '/parent/achievements', icon: Award, group: 'SCHOOL' },
    { label: 'Feedback', href: '/parent/feedback', icon: FileText, group: 'SCHOOL' },
    { label: 'My Profile', href: '/parent/profile', icon: User, group: 'ACCOUNT' },
  ];

  return <DashboardLayout menuItems={menuItems}>{children}</DashboardLayout>;
}
