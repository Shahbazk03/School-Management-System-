'use client';

import { useAuth } from '@/auth/AuthContext';
import {
  useCurrentTeacher,
  useTodayTimetable,
  useNotices,
  useTeacherAssignments,
  useAllStudents,
  useUpcomingExams,
} from '@/api/hooks';
import {
  LoadingSpinner,
  EmptyState,
  ErrorState,
  SectionCard,
  Badge,
  getGreeting,
  Skeleton,
  StatCard,
} from '@/components/ui';
import {
  BookOpen,
  CheckSquare,
  Clock,
  User as UserIcon,
  FileText,
  Bell,
  Megaphone,
  ChevronRight,
  Users,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';

function TodaySchedule({ teacherId }: { teacherId: string }) {
  const { data: allClasses, loading, error, refetch } = useTodayTimetable();
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const parseMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };

  if (loading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  if (error) return <ErrorState message="Unable to load schedule." onRetry={refetch} />;

  // Filter for this teacher's classes
  const myClasses = (allClasses || []).filter((c: any) => c.teacherId === teacherId);
  if (myClasses.length === 0) return <EmptyState icon={Clock} title="No classes today" description="Your schedule is clear for today." />;

  return (
    <div className="space-y-3">
      {myClasses.map((cls: any, i: number) => {
        const startMins = parseMins(cls.startTime);
        const endMins = parseMins(cls.endTime);
        const isCurrent = nowMins >= startMins && nowMins < endMins;
        return (
          <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isCurrent ? 'border-emerald-400 bg-emerald-50 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}>
            <div className="w-20 text-center shrink-0">
              <p className="font-bold text-sm text-slate-900">{cls.startTime}</p>
              <p className="text-xs text-slate-400">{cls.endTime}</p>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-900">
                  Class {cls.classSection?.class?.name}-{cls.classSection?.section?.name}
                </p>
                {isCurrent && <span className="text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded">NOW</span>}
              </div>
              <p className="text-xs text-slate-500">{cls.subject?.subjectName} {cls.room ? `· Room ${cls.room}` : ''}</p>
            </div>
            <Link href="/teacher/attendance" className="shrink-0 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors">
              Attendance
            </Link>
          </div>
        );
      })}
    </div>
  );
}

function AssignedClassesList({ teacherId }: { teacherId: string }) {
  const { data: assignments, loading, error, refetch } = useTeacherAssignments(teacherId);
  if (loading) return <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  if (error) return <ErrorState message="Unable to load classes." onRetry={refetch} />;
  if (!assignments || assignments.length === 0) return <EmptyState icon={BookOpen} title="No classes assigned" description="Contact admin to assign you to classes." />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {assignments.map((c: any, i: number) => (
        <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
          <div className="flex justify-between items-start mb-2">
            <p className="font-extrabold text-slate-900">
              {c.classSection?.class?.name}-{c.classSection?.section?.name}
            </p>
            {c.isClassTeacher && <Badge variant="warning">Class Teacher</Badge>}
          </div>
          <Badge variant="info">{c.subject?.subjectName || 'Subject'}</Badge>
        </div>
      ))}
    </div>
  );
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { data: teacher, loading, error } = useCurrentTeacher();
  const { data: notices } = useNotices('TEACHERS', 3);
  const { data: allStudents } = useAllStudents();
  const { data: upcomingExams } = useUpcomingExams();

  if (loading) return <LoadingSpinner label="Loading teacher workspace..." />;
  if (error) return <ErrorState message="Unable to load teacher profile." />;

  const greeting = getGreeting();
  const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : user?.loginId;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* COMPACT HERO */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-700 to-teal-700 shadow-lg">
        <div className="relative px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
            <UserIcon size={28} className="text-white" />
          </div>
          <div className="text-white flex-1 min-w-0">
            <p className="text-emerald-100 text-sm">{greeting} 👋</p>
            <h1 className="text-2xl font-extrabold truncate">{teacherName}</h1>
            <div className="flex flex-wrap gap-2 mt-1">
              {teacher?.employeeId && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/15 border border-white/10">EMP: {teacher.employeeId}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: CheckSquare, label: 'Mark Attendance', href: '/teacher/attendance', bg: 'bg-emerald-50 text-emerald-600', border: 'hover:border-emerald-300' },
          { icon: FileText, label: 'Enter Marks', href: '/teacher/marks', bg: 'bg-blue-50 text-blue-600', border: 'hover:border-blue-300' },
          { icon: BookOpen, label: 'My Classes', href: '/teacher/classes', bg: 'bg-indigo-50 text-indigo-600', border: 'hover:border-indigo-300' },
          { icon: Clock, label: 'Timetable', href: '/teacher/timetable', bg: 'bg-purple-50 text-purple-600', border: 'hover:border-purple-300' },
        ].map((a, i) => (
          <Link key={i} href={a.href} className={`flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:-translate-y-0.5 transition-all ${a.border}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${a.bg}`}><a.icon size={24} /></div>
            <span className="font-bold text-slate-800">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Students" value={allStudents?.length ?? '—'} icon={GraduationCap} color="bg-blue-50 text-blue-600" />
        <StatCard label="Today's Exams" value={upcomingExams?.filter((e: any) => { const d = new Date(e.startDate); const t = new Date(); return d.toDateString() === t.toDateString(); }).length ?? 0} icon={BookOpen} color="bg-amber-50 text-amber-600" />
        <StatCard label="School ID" value={teacher?.teacherId?.slice(-6) || '—'} icon={UserIcon} color="bg-slate-50 text-slate-600" sub={teacher?.teacherId} />
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* TODAY'S SCHEDULE */}
          <SectionCard
            title={<span className="flex items-center gap-2"><Clock size={16} className="text-indigo-600" />Today's Teaching Schedule</span>}
            action={<Link href="/teacher/timetable" className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">Full <ChevronRight size={12} /></Link>}
          >
            {teacher ? <TodaySchedule teacherId={teacher.id} /> : <Skeleton className="h-32 w-full" />}
          </SectionCard>

          {/* ASSIGNED CLASSES */}
          <SectionCard
            title={<span className="flex items-center gap-2"><BookOpen size={16} className="text-blue-600" />Assigned Classes</span>}
          >
            {teacher ? <AssignedClassesList teacherId={teacher.id} /> : <Skeleton className="h-32 w-full" />}
          </SectionCard>
        </div>

        <div className="space-y-6">

          {/* NOTICES */}
          <SectionCard title={<span className="flex items-center gap-2"><Bell size={16} className="text-rose-500" />School Notices</span>}>
            {!notices ? <Skeleton className="h-32 w-full" /> : notices.length === 0 ? (
              <EmptyState icon={Bell} title="No new notices" />
            ) : (
              <div className="space-y-3">
                {notices.map((n: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-rose-50 border-l-4 border-rose-400">
                    <p className="font-bold text-sm text-slate-900">{n.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.content}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(n.publishDate || n.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* FACULTY LINKS */}
          <div className="bg-slate-900 rounded-2xl p-5">
            <h3 className="font-bold text-white text-sm mb-4">Faculty Resources</h3>
            <div className="space-y-2">
              {[
                { label: 'Student Directory', href: '/teacher/classes' },
                { label: 'Mark Entry Sheet', href: '/teacher/marks' },
                { label: 'My Profile', href: '/teacher/profile' },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors border border-white/5">
                  <span className="text-sm font-medium text-white">{l.label}</span>
                  <ChevronRight size={14} className="text-slate-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
