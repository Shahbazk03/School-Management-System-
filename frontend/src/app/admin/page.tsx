'use client';

import {
  useAllStudents,
  useAllTeachers,
  useAllParents,
  useAllClasses,
  useAllSessions,
  useAllFeedback,
  useNotices,
  useAuditLogs,
  useUpcomingExams,
} from '@/api/hooks';
import {
  LoadingSpinner,
  EmptyState,
  ErrorState,
  SectionCard,
  Badge,
  StatCard,
  Skeleton,
} from '@/components/ui';
import {
  Users,
  GraduationCap,
  Building2,
  Calendar,
  Bell,
  Activity,
  Settings,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: students, loading: sLoad } = useAllStudents();
  const { data: teachers, loading: tLoad } = useAllTeachers();
  const { data: parents, loading: pLoad } = useAllParents();
  const { data: classes, loading: cLoad } = useAllClasses();
  const { data: sessions } = useAllSessions();
  const { data: allFeedback } = useAllFeedback();
  const { data: notices, loading: noticesLoading, error: noticesError, refetch: noticesRefetch } = useNotices('ALL', 4);
  const { data: logs, loading: logsLoading, error: logsError, refetch: logsRefetch } = useAuditLogs(6);
  const { data: upcomingExams } = useUpcomingExams();

  const pendingFeedback = allFeedback?.filter((f: any) => f.status === 'PENDING') || [];
  const currentSession = sessions?.find((s: any) => s.isCurrent) || sessions?.[sessions?.length - 1];

  const statsLoading = sLoad || tLoad || pLoad || cLoad;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* HERO */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg border border-slate-700/50">
        <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
            <ShieldCheck size={28} className="text-blue-400" />
          </div>
          <div className="text-white flex-1">
            <h1 className="text-2xl font-extrabold">System Administration</h1>
            <p className="text-slate-400 text-sm">{currentSession ? `Current Session: ${currentSession.name}` : 'School Management Dashboard'}</p>
          </div>
          <Link href="/admin/settings" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/10 flex items-center gap-2 transition-colors">
            <Settings size={16} /> Settings
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          [1,2,3,4].map(i => <Skeleton key={i} className="h-28 w-full" />)
        ) : (
          <>
            <StatCard label="Total Students" value={students?.length ?? 0} icon={GraduationCap} color="bg-blue-50 text-blue-600" />
            <StatCard label="Total Teachers" value={teachers?.length ?? 0} icon={Users} color="bg-emerald-50 text-emerald-600" />
            <StatCard label="Total Parents" value={parents?.length ?? 0} icon={Users} color="bg-purple-50 text-purple-600" />
            <StatCard label="Classes" value={classes?.length ?? 0} icon={Building2} color="bg-orange-50 text-orange-600" />
          </>
        )}
      </div>

      {/* SECONDARY STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pending Feedback</p>
          <p className="text-2xl font-black text-amber-600">{pendingFeedback.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Upcoming Exams</p>
          <p className="text-2xl font-black text-blue-600">{upcomingExams?.length ?? '—'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Academic Sessions</p>
          <p className="text-2xl font-black text-slate-900">{sessions?.length ?? '—'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Session</p>
          <p className="text-lg font-black text-slate-900 truncate">{currentSession?.name ?? '—'}</p>
        </div>
      </div>

      {/* QUICK MANAGEMENT */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Manage Students', href: '/admin/students', icon: GraduationCap, color: 'bg-blue-600', count: students?.length },
          { label: 'Manage Teachers', href: '/admin/teachers', icon: Users, color: 'bg-emerald-600', count: teachers?.length },
          { label: 'Classes', href: '/admin/classes', icon: Building2, color: 'bg-purple-600', count: classes?.length },
          { label: 'Attendance', href: '/admin/attendance', icon: Calendar, color: 'bg-orange-500', count: null },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all group">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${item.color} text-white`}>
              <item.icon size={22} />
            </div>
            <p className="font-bold text-slate-900 text-sm">{item.label}</p>
            {item.count !== null && item.count !== undefined && (
              <p className="text-xs text-slate-500 mt-1">{item.count} records</p>
            )}
          </Link>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* AUDIT LOGS */}
          <SectionCard title={<span className="flex items-center gap-2"><Activity size={16} className="text-indigo-600" />Recent System Activity</span>}>
            {logsLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : logsError ? (
              <ErrorState message="Unable to load audit logs." onRetry={logsRefetch} />
            ) : !logs || logs.length === 0 ? (
              <EmptyState icon={Activity} title="No system activity" description="Activity will appear here as users interact with the system." />
            ) : (
              <div className="divide-y divide-slate-100">
                {logs.map((log: any, i: number) => (
                  <div key={i} className="py-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500 mt-0.5">
                      <Activity size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-900">
                        <span className="font-bold">{log.user?.loginId || 'System'}</span>{' '}
                        <span className="font-medium text-slate-700">→ {log.action}</span>
                      </p>
                      {log.details && <p className="text-xs text-slate-500 truncate">{log.details}</p>}
                      <p className="text-[10px] text-slate-400 mt-0.5">{new Date(log.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* PENDING FEEDBACK */}
          <SectionCard
            title={<span className="flex items-center gap-2"><MessageSquare size={16} className="text-amber-500" />Pending Feedback</span>}
            action={<Link href="/admin/feedback" className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1">All <ChevronRight size={12} /></Link>}
          >
            {pendingFeedback.length === 0 ? (
              <EmptyState icon={MessageSquare} title="All feedback resolved" description="No pending tickets." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pendingFeedback.slice(0, 4).map((f: any, i: number) => (
                  <div key={i} className="border border-slate-200 rounded-xl p-4 bg-amber-50/50 border-l-4 border-l-amber-400">
                    <div className="flex justify-between items-start mb-1">
                      <Badge variant="warning">{f.category || 'General'}</Badge>
                      <span className="text-[10px] text-slate-400">{new Date(f.submittedAt || f.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p className="font-bold text-sm text-slate-900 mt-2">{f.subject || f.title}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{f.message || f.content}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6">

          {/* NOTICES */}
          <SectionCard
            title={<span className="flex items-center gap-2"><Bell size={16} className="text-rose-500" />Published Notices</span>}
            action={<Link href="/admin/notices" className="text-xs font-bold text-rose-500 hover:underline">All</Link>}
          >
            {noticesLoading ? (
              <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : noticesError ? (
              <ErrorState message="Failed to load notices." onRetry={noticesRefetch} />
            ) : !notices || notices.length === 0 ? (
              <EmptyState icon={Bell} title="No notices published" />
            ) : (
              <div className="space-y-3">
                {notices.map((n: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className="font-bold text-sm text-slate-900 line-clamp-1">{n.title}</p>
                      <Badge variant="default">{n.targetAudience || 'ALL'}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{n.content}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(n.publishDate || n.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* UPCOMING EXAMS */}
          <SectionCard title={<span className="flex items-center gap-2"><BookOpen size={16} className="text-blue-600" />Upcoming Exams</span>}>
            {!upcomingExams ? <Skeleton className="h-20 w-full" /> : upcomingExams.length === 0 ? (
              <EmptyState icon={BookOpen} title="No upcoming exams" />
            ) : (
              <div className="space-y-2">
                {upcomingExams.slice(0, 4).map((exam: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{exam.name}</p>
                      <p className="text-xs text-slate-500">{new Date(exam.startDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    <Badge variant="info">{Math.max(0, Math.round((new Date(exam.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}d</Badge>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

        </div>
      </div>
    </div>
  );
}
