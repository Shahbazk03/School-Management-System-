'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { BookOpen, CheckSquare, Clock, FileText, User } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { redirect } from 'next/navigation';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  
  if (!user || user.role !== 'TEACHER') {
    redirect('/login');
  }

  const menuItems = [
    { label: 'Home', href: '/teacher', icon: User, group: 'MAIN' },
    { label: 'My Classes', href: '/teacher/classes', icon: BookOpen, group: 'TEACHING' },
    { label: 'Mark Attendance', href: '/teacher/attendance', icon: CheckSquare, group: 'TEACHING' },
    { label: 'Enter Marks', href: '/teacher/marks', icon: FileText, group: 'TEACHING' },
    { label: 'Timetable', href: '/teacher/timetable', icon: Clock, group: 'ACADEMICS' },
    { label: 'My Profile', href: '/teacher/profile', icon: User, group: 'ACCOUNT' },
  ];

  return <DashboardLayout menuItems={menuItems}>{children}</DashboardLayout>;
}
