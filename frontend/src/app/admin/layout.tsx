'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { Users, BookOpen, Settings, LayoutDashboard, Calendar, ClipboardList, CheckSquare } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { redirect } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  
  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, group: 'HOME' },
    
    { label: 'Students', href: '/admin/students', icon: Users, group: 'PEOPLE' },
    { label: 'Parents', href: '/admin/parents', icon: Users, group: 'PEOPLE' },
    { label: 'Teachers', href: '/admin/teachers', icon: BookOpen, group: 'PEOPLE' },
    
    { label: 'Classes', href: '/admin/classes', icon: ClipboardList, group: 'ACADEMICS' },
    { label: 'Sections', href: '/admin/sections', icon: ClipboardList, group: 'ACADEMICS' },
    { label: 'Subjects', href: '/admin/subjects', icon: BookOpen, group: 'ACADEMICS' },
    { label: 'Enrollments & Promotion', href: '/admin/enrollments', icon: Users, group: 'ACADEMICS' },
    { label: 'Timetable', href: '/admin/timetable', icon: Calendar, group: 'ACADEMICS' },
    { label: 'Examinations', href: '/admin/examinations', icon: BookOpen, group: 'ACADEMICS' },
    { label: 'Marks Entry', href: '/admin/marks', icon: ClipboardList, group: 'ACADEMICS' },
    { label: 'Report Cards', href: '/admin/report-cards', icon: BookOpen, group: 'ACADEMICS' },
    
    { label: 'Attendance', href: '/admin/attendance', icon: CheckSquare, group: 'ATTENDANCE' },
    
    { label: 'News', href: '/admin/news', icon: ClipboardList, group: 'COMMUNICATION' },
    { label: 'Notices', href: '/admin/notices', icon: ClipboardList, group: 'COMMUNICATION' },
    { label: 'Achievements', href: '/admin/achievements', icon: ClipboardList, group: 'COMMUNICATION' },
    { label: 'Feedback', href: '/admin/feedback', icon: ClipboardList, group: 'COMMUNICATION' },
    
    { label: 'Reports & Analytics', href: '/admin/reports', icon: ClipboardList, group: 'SYSTEM' },
    { label: 'Report Card Settings', href: '/admin/report-card-settings', icon: BookOpen, group: 'SYSTEM' },
    { label: 'Files', href: '/admin/files', icon: Users, group: 'SYSTEM' },
    { label: 'Credentials', href: '/admin/credentials', icon: Users, group: 'SYSTEM' },
    { label: 'Academic Sessions', href: '/admin/sessions', icon: Calendar, group: 'SYSTEM' },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: ClipboardList, group: 'SYSTEM' },
    { label: 'Settings', href: '/admin/settings', icon: Settings, group: 'SYSTEM' },
  ];

  return <DashboardLayout menuItems={menuItems}>{children}</DashboardLayout>;
}
