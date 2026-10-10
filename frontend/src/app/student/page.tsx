'use client';

import { useAuth } from '@/auth/AuthContext';
import {
  useCurrentStudent,
  useCurrentSession,
  useStudentAttendanceStats,
  useTodayTimetable,
  useUpcomingExams,
  useNews,
  useNotices,
  useStudentReportCards,
  useStudentAchievements,
} from '@/api/hooks';
import {
  LoadingSpinner,
  EmptyState,
  ErrorState,
  SectionCard,
  Badge,
  AttendanceBadge,
  StatCard,
  daysFromNow,
  getGreeting,
  priorityColor,
  Skeleton,
} from '@/components/ui';
import {
  Calendar,
  Clock,
  BookOpen,
  FileText,
  Award,
  Bell,
  MessageSquare,
  Megaphone,
  TrendingUp,
  Download,
  ChevronRight,
  User as UserIcon,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// ─── Attendance Widget ────────────────────────────────────────────────────────

function AttendanceWidget({ studentId, sessionId }: { studentId: string; sessionId: string }) {
  const { data: stats, loading, error, refetch } = useStudentAttendanceStats(studentId, sessionId);

  if (loading) return (
    <div className="space-y-3">
      <Skeleton className="h-48 w-48 rounded-full mx-auto" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );

  if (error) return <ErrorState message="Unable to load attendance." onRetry={refetch} />;

  if (!stats || stats.status === 'NO_DATA') {
    return (
      <EmptyState
        icon={Calendar}
        title="No attendance recorded yet"
        description="Attendance records will appear here once your teacher marks them."
      />
    );
  }

  const chartData = [
    { name: 'Present', value: stats.present || 0.01, color: '#10B981' },
    { name: 'Absent', value: stats.absent || 0.01, color: '#EF4444' },
    { name: 'Leave', value: stats.leave || 0.01, color: '#F59E0B' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <div className="relative h-44 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
              {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-slate-900">{stats.percentage}%</span>
          <AttendanceBadge percentage={stats.percentage} />
        </div>
      </div>
      <div className="space-y-3">
        {[
          { label: 'Present', value: stats.present, color: 'bg-emerald-500' },
          { label: 'Absent', value: stats.absent, color: 'bg-red-500' },
          { label: 'Leave', value: stats.leave, color: 'bg-amber-500' },
        ].map((row) => (
          <div key={row.label} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
              <span className="text-sm font-semibold text-slate-700">{row.label}</span>
            </div>
            <span className="font-bold text-slate-900">{row.value}</span>
          </div>
        ))}
        <div className="text-xs text-slate-400 text-center pt-1">Total: {stats.total} working days</div>
      </div>
    </div>
  );
}

// ─── Timetable Widget ─────────────────────────────────────────────────────────

function TimetableWidget() {
  const { data: classes, loading, error, refetch } = useTodayTimetable();
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const parseMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
    </div>
  );
  if (error) return <ErrorState message="Unable to load timetable." onRetry={refetch} />;
  if (!classes || classes.length === 0) return (
    <EmptyState icon={Clock} title="No classes today" description="No classes scheduled for today." />
  );

  return (
    <div className="space-y-3">
      {classes.map((cls: any, i: number) => {
        const startMins = parseMins(cls.startTime);
        const endMins = parseMins(cls.endTime);
        const isCurrent = nowMins >= startMins && nowMins < endMins;
        const isNext = !classes.slice(0, i).some((c: any) => nowMins >= parseMins(c.startTime) && nowMins < parseMins(c.endTime)) && startMins > nowMins;
        return (
          <div
            key={i}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isCurrent ? 'border-blue-400 bg-blue-50 shadow-sm' : isNext ? 'border-indigo-200 bg-indigo-50/60' : 'border-slate-100 hover:border-slate-200'}`}
          >
            <div className="w-20 text-center shrink-0">
              <p className="font-bold text-sm text-slate-900">{cls.startTime}</p>
              <p className="text-xs text-slate-400">{cls.endTime}</p>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-bold text-slate-900 truncate">{cls.subject?.subjectName || 'Subject'}</p>
                {isCurrent && <span className="shrink-0 text-[10px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded">NOW</span>}
                {isNext && <span className="shrink-0 text-[10px] font-bold bg-indigo-400 text-white px-1.5 py-0.5 rounded">NEXT</span>}
              </div>
              <p className="text-xs text-slate-500">
                {cls.teacher ? `${cls.teacher.firstName} ${cls.teacher.lastName}` : ''}
                {cls.room ? ` · Room ${cls.room}` : ''}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Exams Widget ────────────────────────────────────────────────────────────

function ExamsWidget() {
  const { data: exams, loading, error, refetch } = useUpcomingExams();

  if (loading) return <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>;
  if (error) return <ErrorState message="Unable to load exams." onRetry={refetch} />;
  if (!exams || exams.length === 0) return (
    <EmptyState icon={BookOpen} title="No upcoming exams" description="No exams scheduled." />
  );

  return (
    <div className="space-y-3">
      {exams.slice(0, 3).map((exam: any, i: number) => {
        const days = daysFromNow(exam.startDate);
        return (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors bg-white">
            <div>
              <p className="font-bold text-sm text-slate-900">{exam.name}</p>
              <p className="text-xs text-slate-500">{new Date(exam.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
            <div className="text-right">
              <Badge variant={days <= 3 ? 'error' : days <= 7 ? 'warning' : 'info'}>
                {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Notices Widget ──────────────────────────────────────────────────────────

function NoticesWidget() {
  const { data: notices, loading, error, refetch } = useNotices('STUDENTS', 4);

  if (loading) return <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  if (error) return <ErrorState message="Unable to load notices." onRetry={refetch} />;
  if (!notices || notices.length === 0) return (
    <EmptyState icon={Bell} title="No notices" description="No notices published yet." />
  );

  return (
    <div className="space-y-3">
      {notices.map((n: any, i: number) => (
        <div key={i} className={`p-4 rounded-xl border-l-4 transition-colors ${priorityColor(n.priority)}`}>
          <div className="flex justify-between items-start gap-2 mb-1">
            <p className="font-bold text-slate-900 text-sm leading-tight">{n.title}</p>
            <Badge variant={n.priority === 'HIGH' || n.priority === 'URGENT' ? 'error' : n.priority === 'MEDIUM' ? 'warning' : 'info'}>
              {n.priority || 'NORMAL'}
            </Badge>
          </div>
          <p className="text-xs text-slate-600 line-clamp-2">{n.content}</p>
          <p className="text-[10px] text-slate-400 mt-1">{new Date(n.publishDate || n.createdAt).toLocaleDateString('en-IN')}</p>
        </div>
      ))}
    </div>
  );
}

// ─── News Widget ─────────────────────────────────────────────────────────────

function NewsWidget() {
  const { data: news, loading, error, refetch } = useNews(3);

  if (loading) return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[1,2].map(i => <Skeleton key={i} className="h-48 w-full" />)}</div>;
  if (error) return <ErrorState message="Unable to load news." onRetry={refetch} />;
  if (!news || news.length === 0) return (
    <EmptyState icon={Megaphone} title="No school news" description="No news has been published yet." />
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {news.map((item: any, i: number) => (
        <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group">
          <div className="h-28 bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center relative overflow-hidden">
            {item.image || item.imageUrl ? (
              <img src={item.image || item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <Megaphone className="text-cyan-300 w-10 h-10" />
            )}
            <div className="absolute top-2 right-2 text-[10px] font-bold bg-white/90 backdrop-blur px-2 py-0.5 rounded text-slate-600">
              {new Date(item.publishDate || item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </div>
          </div>
          <div className="p-4">
            <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{item.title}</h4>
            <p className="text-xs text-slate-500 line-clamp-2">{item.content || item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Report Card Widget ──────────────────────────────────────────────────────

function ReportCardWidget({ studentId }: { studentId: string }) {
  const { data: cards, loading, error, refetch } = useStudentReportCards(studentId);

  if (loading) return <Skeleton className="h-32 w-full" />;
  if (error) return <ErrorState message="Unable to load report card." onRetry={refetch} />;
  if (!cards || cards.length === 0) return (
    <EmptyState icon={FileText} title="No report card" description="No report cards available yet." />
  );

  const latest = cards[0];
  return (
    <div>
      <p className="text-xs text-slate-400 font-medium mb-2">{latest.exam?.name || 'Recent Exam'}</p>
      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-black text-white">{latest.percentage}%</span>
        <Badge variant={latest.result === 'PASS' ? 'success' : 'error'}>{latest.grade}</Badge>
      </div>
      <div className="space-y-1 text-sm text-slate-300 mb-5">
        <div className="flex justify-between"><span>Total Marks</span><span className="font-bold text-white">{latest.totalMarks}</span></div>
        <div className="flex justify-between"><span>Result</span><span className={`font-bold ${latest.result === 'PASS' ? 'text-emerald-400' : 'text-red-400'}`}>{latest.result}</span></div>
      </div>
      <Link href="/student/report-cards" className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/10 hover:bg-white/20 transition-colors rounded-xl text-sm font-bold border border-white/10">
        <Download size={15} /> Download Report
      </Link>
    </div>
  );
}

// ─── Achievements Widget ──────────────────────────────────────────────────────

function AchievementsWidget({ studentId }: { studentId: string }) {
  const { data: achievements, loading, error, refetch } = useStudentAchievements(studentId);

  if (loading) return <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>;
  if (error) return <ErrorState message="Unable to load achievements." onRetry={refetch} />;
  if (!achievements || achievements.length === 0) return (
    <EmptyState icon={Award} title="No achievements yet" description="Achievements will appear here once added." />
  );

  return (
    <div className="space-y-3">
      {achievements.slice(0, 4).map((ach: any, i: number) => (
        <div key={i} className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
            <Award size={16} />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900">{ach.title}</p>
            <p className="text-xs text-slate-500">{ach.category} · {ach.date ? new Date(ach.date).getFullYear() : ''}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: student, loading: studentLoading, error: studentError } = useCurrentStudent();
  const { data: session, loading: sessionLoading } = useCurrentSession();

  if (studentLoading || sessionLoading) {
    return <LoadingSpinner label="Loading your digital campus..." />;
  }

  if (studentError) {
    return (
      <div className="flex items-center justify-center h-96">
        <ErrorState message="Unable to load your profile. Please try again." />
      </div>
    );
  }

  const greeting = getGreeting();
  const studentName = student ? `${student.firstName} ${student.lastName}` : user?.loginId || 'Student';

  // Get current enrollment to find class and section
  const currentEnrollment = student?.enrollments?.find(
    (e: any) => e.academicSessionId === session?.id
  ) || student?.enrollments?.[student?.enrollments?.length - 1];

  const className = currentEnrollment?.classSection
    ? `${currentEnrollment.classSection.class?.name}-${currentEnrollment.classSection.section?.name}`
    : '—';

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8">

      {/* COMPACT HERO */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-lg">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_white_0%,_transparent_60%)]" />
        <div className="relative px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <UserIcon size={32} className="text-white" />
          </div>
          <div className="flex-1 text-white min-w-0">
            <p className="text-blue-100 text-sm font-medium">{greeting} 👋</p>
            <h1 className="text-2xl font-extrabold truncate">{studentName}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {className !== '—' && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/15 border border-white/10">Class {className}</span>
              )}
              {session && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/15 border border-white/10">Session {session.name}</span>
              )}
              {student?.admissionNo && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/15 border border-white/10">Adm: {student.admissionNo}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
        {[
          { icon: Calendar, label: 'Attendance', href: '/student/attendance', bg: 'bg-emerald-50 text-emerald-600', hover: 'hover:bg-emerald-100 hover:border-emerald-200' },
          { icon: Clock, label: 'Timetable', href: '/student/timetable', bg: 'bg-indigo-50 text-indigo-600', hover: 'hover:bg-indigo-100 hover:border-indigo-200' },
          { icon: BookOpen, label: 'Exams', href: '/student/exams', bg: 'bg-blue-50 text-blue-600', hover: 'hover:bg-blue-100 hover:border-blue-200' },
          { icon: FileText, label: 'Results', href: '/student/report-cards', bg: 'bg-purple-50 text-purple-600', hover: 'hover:bg-purple-100 hover:border-purple-200' },
          { icon: FileText, label: 'Papers', href: '/student/question-papers', bg: 'bg-orange-50 text-orange-600', hover: 'hover:bg-orange-100 hover:border-orange-200' },
          { icon: Award, label: 'Awards', href: '/student/achievements', bg: 'bg-yellow-50 text-yellow-600', hover: 'hover:bg-yellow-100 hover:border-yellow-200' },
          { icon: MessageSquare, label: 'Feedback', href: '/student/feedback', bg: 'bg-rose-50 text-rose-600', hover: 'hover:bg-rose-100 hover:border-rose-200' },
          { icon: Bell, label: 'Notices', href: '/student/notices', bg: 'bg-cyan-50 text-cyan-600', hover: 'hover:bg-cyan-100 hover:border-cyan-200' },
        ].map((a, i) => (
          <Link key={i} href={a.href} className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-xl bg-white border border-transparent shadow-sm transition-all hover:-translate-y-0.5 ${a.hover}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-1.5 ${a.bg}`}>
              <a.icon size={20} />
            </div>
            <span className="text-[10px] md:text-xs font-semibold text-slate-700 text-center leading-tight">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* MAIN CONTENT: 65/35 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT 65% */}
        <div className="lg:col-span-2 space-y-6">

          {/* ATTENDANCE */}
          <SectionCard
            title={<span className="flex items-center gap-2"><Calendar size={18} className="text-blue-600" />Attendance — {session?.name || '—'}</span>}
            action={
              <Link href="/student/attendance" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                View History <ChevronRight size={14} />
              </Link>
            }
          >
            {student && session ? (
              <AttendanceWidget studentId={student.id} sessionId={session.id} />
            ) : (
              <EmptyState icon={Calendar} title="Profile loading..." />
            )}
          </SectionCard>

          {/* TODAY'S TIMETABLE */}
          <SectionCard
            title={<span className="flex items-center gap-2"><Clock size={18} className="text-indigo-600" />Today's Classes</span>}
            action={
              <Link href="/student/timetable" className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                Full Schedule <ChevronRight size={14} />
              </Link>
            }
          >
            <TimetableWidget />
          </SectionCard>

          {/* SCHOOL NEWS */}
          <SectionCard
            title={<span className="flex items-center gap-2"><Megaphone size={18} className="text-cyan-600" />School News</span>}
            action={
              <Link href="/student/notices" className="text-xs font-bold text-cyan-600 flex items-center gap-1 hover:underline">
                View All <ChevronRight size={14} />
              </Link>
            }
          >
            <NewsWidget />
          </SectionCard>
        </div>

        {/* RIGHT 35% */}
        <div className="space-y-6">

          {/* NOTICES */}
          <SectionCard
            title={<span className="flex items-center gap-2"><Bell size={18} className="text-red-500" />Important Notices</span>}
            action={
              <Link href="/student/notices" className="text-xs font-bold text-red-500 flex items-center gap-1 hover:underline">
                All <ChevronRight size={14} />
              </Link>
            }
          >
            <NoticesWidget />
          </SectionCard>

          {/* UPCOMING EXAMS */}
          <SectionCard
            title={<span className="flex items-center gap-2"><BookOpen size={18} className="text-blue-600" />Upcoming Exams</span>}
            action={
              <Link href="/student/exams" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                All <ChevronRight size={14} />
              </Link>
            }
          >
            <ExamsWidget />
          </SectionCard>

          {/* LATEST RESULT */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-lg">
            <h2 className="font-bold text-white text-base mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" /> Latest Result
            </h2>
            {student ? (
              <ReportCardWidget studentId={student.id} />
            ) : (
              <p className="text-slate-400 text-sm">Loading...</p>
            )}
          </div>

          {/* ACHIEVEMENTS */}
          <SectionCard
            title={<span className="flex items-center gap-2"><Award size={18} className="text-yellow-500" />Achievements</span>}
            action={
              <Link href="/student/achievements" className="text-xs font-bold text-yellow-600 flex items-center gap-1 hover:underline">
                All <ChevronRight size={14} />
              </Link>
            }
          >
            {student ? (
              <AchievementsWidget studentId={student.id} />
            ) : (
              <Skeleton className="h-20 w-full" />
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
