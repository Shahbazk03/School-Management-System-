'use client';

import { useAuth } from '@/auth/AuthContext';
import {
  useCurrentParent,
  useParentChildren,
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
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// Reusable: Attendance Widget
function AttendanceWidget({ studentId, sessionId }: { studentId: string; sessionId: string }) {
  const { data: stats, loading, error, refetch } = useStudentAttendanceStats(studentId, sessionId);
  if (loading) return <Skeleton className="h-40 w-full" />;
  if (error) return <ErrorState message="Unable to load attendance." onRetry={refetch} />;
  if (!stats || stats.status === 'NO_DATA') return (
    <EmptyState icon={Calendar} title="No attendance recorded yet" description="Attendance will appear here once marked by the teacher." />
  );
  const chartData = [
    { value: stats.present || 0.01, color: '#10B981' },
    { value: stats.absent || 0.01, color: '#EF4444' },
    { value: stats.leave || 0.01, color: '#F59E0B' },
  ];
  return (
    <div className="flex items-center gap-6">
      <div className="relative h-32 w-32 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={56} paddingAngle={3} dataKey="value" stroke="none">
              {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-black text-slate-900">{stats.percentage}%</span>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        <AttendanceBadge percentage={stats.percentage} />
        <div className="grid grid-cols-3 gap-2 text-center mt-2">
          {[{ l: 'Present', v: stats.present, c: 'text-emerald-600' }, { l: 'Absent', v: stats.absent, c: 'text-red-600' }, { l: 'Leave', v: stats.leave, c: 'text-amber-600' }].map(r => (
            <div key={r.l} className="bg-slate-50 rounded-xl p-2">
              <p className={`text-lg font-black ${r.c}`}>{r.v}</p>
              <p className="text-[10px] font-semibold text-slate-500">{r.l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Reusable: Next Exam
function NextExam() {
  const { data: exams, loading, error, refetch } = useUpcomingExams();
  if (loading) return <Skeleton className="h-20 w-full" />;
  if (error) return <ErrorState message="Unable to load exams." onRetry={refetch} />;
  if (!exams || exams.length === 0) return <EmptyState icon={BookOpen} title="No upcoming exams" />;
  const next = exams[0];
  const days = daysFromNow(next.startDate);
  return (
    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
      <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Next Exam</p>
      <p className="font-bold text-slate-900">{next.name}</p>
      <p className="text-sm text-slate-500">{new Date(next.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
      <Badge variant={days <= 3 ? 'error' : days <= 7 ? 'warning' : 'info'}>
        {days === 0 ? 'Today!' : `${days} days away`}
      </Badge>
    </div>
  );
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const { data: parent, loading: parentLoading } = useCurrentParent();
  const { data: children, loading: childrenLoading } = useParentChildren(parent?.id || null);
  const { data: session } = useCurrentSession();

  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Auto-select first child when loaded
  useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const selectedChild = children?.find((c: any) => c.id === selectedChildId);
  const { data: notices } = useNotices('PARENTS', 3);
  const { data: news } = useNews(3);
  const { data: reportCards } = useStudentReportCards(selectedChildId);
  const { data: achievements } = useStudentAchievements(selectedChildId);

  if (parentLoading) return <LoadingSpinner label="Loading parent portal..." />;

  const greeting = getGreeting();
  const parentName = parent ? `${parent.firstName} ${parent.lastName}` : user?.loginId;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* COMPACT HERO */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-700 shadow-lg">
        <div className="relative px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
            <UserIcon size={28} className="text-white" />
          </div>
          <div className="text-white flex-1 min-w-0">
            <p className="text-blue-100 text-sm">{greeting}, {parentName}</p>
            <h1 className="text-xl font-extrabold">Parent Portal</h1>
            {session && <p className="text-xs text-blue-200 mt-1">Session: {session.name}</p>}
          </div>
        </div>
      </div>

      {/* CHILD SELECTOR */}
      {!childrenLoading && children && children.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
              <UserIcon size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Viewing</p>
              <p className="text-sm font-medium text-slate-700">Select child to view their dashboard</p>
            </div>
          </div>
          <div className="relative w-full sm:w-72 ml-auto">
            <select
              className="w-full appearance-none bg-white border-2 border-blue-200 text-slate-900 text-sm rounded-xl p-3 pr-10 font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
              value={selectedChildId || ''}
              onChange={(e) => setSelectedChildId(e.target.value)}
            >
              {children.map((child: any) => (
                <option key={child.id} value={child.id}>
                  {child.firstName} {child.lastName} — {child.admissionNo || child.permanentId}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-500">
              <ChevronDown size={18} strokeWidth={3} />
            </div>
          </div>
        </div>
      )}

      {childrenLoading && <Skeleton className="h-20 w-full" />}

      {!childrenLoading && (!children || children.length === 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <p className="font-bold text-amber-800">No children linked to your account.</p>
          <p className="text-sm text-amber-600 mt-1">Please contact the school admin to link your children.</p>
        </div>
      )}

      {selectedChild && (
        <>
          {/* CHILD INFO BANNER */}
          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <UserIcon size={24} />
            </div>
            <div>
              <p className="font-extrabold text-slate-900">{selectedChild.firstName} {selectedChild.lastName}</p>
              <p className="text-sm text-slate-500">Adm: {selectedChild.admissionNo} · ID: {selectedChild.permanentId}</p>
            </div>
            <div className="ml-auto flex gap-2 flex-wrap">
              {session && <Badge variant="info">Session {session.name}</Badge>}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {[
              { icon: Calendar, label: 'Attendance', href: '/parent/attendance', bg: 'bg-emerald-50 text-emerald-600' },
              { icon: Clock, label: 'Timetable', href: '/parent/timetable', bg: 'bg-indigo-50 text-indigo-600' },
              { icon: BookOpen, label: 'Exams', href: '/parent/exams', bg: 'bg-blue-50 text-blue-600' },
              { icon: FileText, label: 'Results', href: '/parent/report-cards', bg: 'bg-purple-50 text-purple-600' },
              { icon: FileText, label: 'Papers', href: '/parent/question-papers', bg: 'bg-orange-50 text-orange-600' },
              { icon: Award, label: 'Awards', href: '/parent/achievements', bg: 'bg-yellow-50 text-yellow-600' },
              { icon: MessageSquare, label: 'Feedback', href: '/parent/feedback', bg: 'bg-rose-50 text-rose-600' },
              { icon: Bell, label: 'Notices', href: '/parent/notices', bg: 'bg-cyan-50 text-cyan-600' },
            ].map((a, i) => (
              <Link key={i} href={a.href} className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:-translate-y-0.5 transition-all hover:border-slate-200">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-1 ${a.bg}`}><a.icon size={18} /></div>
                <span className="text-[10px] font-semibold text-slate-700 text-center">{a.label}</span>
              </Link>
            ))}
          </div>

          {/* MAIN CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">

              {/* ATTENDANCE */}
              {session && (
                <SectionCard
                  title={<span className="flex items-center gap-2"><Calendar size={16} className="text-blue-600" />Attendance · {session.name}</span>}
                  action={<Link href="/parent/attendance" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">View <ChevronRight size={12} /></Link>}
                >
                  <AttendanceWidget studentId={selectedChildId!} sessionId={session.id} />
                </SectionCard>
              )}

              {/* NEWS */}
              <SectionCard title={<span className="flex items-center gap-2"><Megaphone size={16} className="text-cyan-600" />School News</span>}>
                {!news ? <Skeleton className="h-32 w-full" /> : news.length === 0 ? (
                  <EmptyState icon={Megaphone} title="No news yet" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {news.map((item: any, i: number) => (
                      <div key={i} className="border border-slate-100 rounded-xl overflow-hidden hover:shadow-sm">
                        <div className="h-24 bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                          {item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" /> : <Megaphone className="text-cyan-300 w-8 h-8" />}
                        </div>
                        <div className="p-3">
                          <p className="font-bold text-sm text-slate-900 line-clamp-1">{item.title}</p>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.content || item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>

            <div className="space-y-6">

              {/* NEXT EXAM */}
              <SectionCard title={<span className="flex items-center gap-2"><BookOpen size={16} className="text-blue-600" />Next Exam</span>}>
                <NextExam />
              </SectionCard>

              {/* NOTICES */}
              <SectionCard title={<span className="flex items-center gap-2"><Bell size={16} className="text-red-500" />Notices for Parents</span>}>
                {!notices ? <Skeleton className="h-20 w-full" /> : notices.length === 0 ? (
                  <EmptyState icon={Bell} title="No notices" />
                ) : (
                  <div className="space-y-3">
                    {notices.map((n: any, i: number) => (
                      <div key={i} className={`p-3 rounded-xl border-l-4 ${priorityColor(n.priority)}`}>
                        <p className="font-bold text-sm text-slate-900">{n.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.content}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(n.publishDate || n.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              {/* LATEST RESULT */}
              <div className="bg-slate-900 rounded-2xl p-5">
                <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-3"><TrendingUp size={16} className="text-emerald-400" /> Latest Result</h3>
                {!reportCards ? <Skeleton className="h-20 w-full bg-white/10" /> : reportCards.length === 0 ? (
                  <p className="text-slate-400 text-sm">No report card yet.</p>
                ) : (
                  <div>
                    <p className="text-slate-400 text-xs">{reportCards[0].exam?.name || 'Recent Exam'}</p>
                    <p className="text-4xl font-black text-white my-1">{reportCards[0].percentage}%</p>
                    <Badge variant={reportCards[0].result === 'PASS' ? 'success' : 'error'}>{reportCards[0].grade} · {reportCards[0].result}</Badge>
                    <Link href="/parent/report-cards" className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-white/70 hover:text-white border border-white/10 rounded-xl py-2 bg-white/5 hover:bg-white/10 transition-colors">
                      <Download size={12} /> Download Report
                    </Link>
                  </div>
                )}
              </div>

              {/* ACHIEVEMENTS */}
              <SectionCard title={<span className="flex items-center gap-2"><Award size={16} className="text-yellow-500" />Achievements</span>}>
                {!achievements ? <Skeleton className="h-20 w-full" /> : achievements.length === 0 ? (
                  <EmptyState icon={Award} title="No achievements yet" />
                ) : (
                  <div className="space-y-3">
                    {achievements.slice(0, 3).map((a: any, i: number) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-7 h-7 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0"><Award size={14} /></div>
                        <div><p className="font-bold text-sm text-slate-900">{a.title}</p><p className="text-xs text-slate-500">{a.category}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
