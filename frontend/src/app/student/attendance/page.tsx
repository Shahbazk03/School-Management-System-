'use client';

import {
  useCurrentStudent,
  useCurrentSession,
  useStudentAttendanceStats,
  useStudentAttendanceHistory,
} from '@/api/hooks';
import {
  LoadingSpinner,
  EmptyState,
  ErrorState,
  SectionCard,
  AttendanceBadge,
  Badge,
  Skeleton,
} from '@/components/ui';
import { Calendar, CheckCircle2, XCircle, Clock, TrendingDown } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { PieChart, Pie } from 'recharts';

function CurrentSessionStats({ studentId, sessionId, sessionName }: { studentId: string; sessionId: string; sessionName: string }) {
  const { data: stats, loading, error, refetch } = useStudentAttendanceStats(studentId, sessionId);

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
    </div>
  );
  if (error) return <ErrorState message="Unable to load attendance." onRetry={refetch} />;
  if (!stats || stats.status === 'NO_DATA') return (
    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
      <Calendar size={48} className="mx-auto text-slate-300 mb-3" />
      <p className="font-semibold text-slate-600">No attendance recorded for {sessionName}</p>
      <p className="text-sm text-slate-400 mt-1">Records will appear once your teacher marks attendance.</p>
    </div>
  );

  const chartData = [
    { name: 'Present', value: stats.present || 0.01, color: '#10B981' },
    { name: 'Absent', value: stats.absent || 0.01, color: '#EF4444' },
    { name: 'Leave', value: stats.leave || 0.01, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-6">
      {/* Big Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2 md:col-span-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Attendance</p>
          {stats.percentage !== null ? (
            <>
              <p className={`text-4xl font-black ${stats.percentage >= 75 ? 'text-emerald-600' : stats.percentage >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                {stats.percentage}%
              </p>
              <div className="mt-2"><AttendanceBadge percentage={stats.percentage} /></div>
            </>
          ) : (
            <p className="text-sm text-slate-500 mt-2">No records yet</p>
          )}
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Working Days</p>
          </div>
          <p className="text-4xl font-black text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Present</p>
          </div>
          <p className="text-4xl font-black text-emerald-700">{stats.present}</p>
        </div>
        <div className="bg-red-50 p-5 rounded-2xl border border-red-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={16} className="text-red-500" />
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Absent</p>
          </div>
          <p className="text-4xl font-black text-red-700">{stats.absent}</p>
        </div>
      </div>

      {/* Pie chart */}
      {stats.total > 0 && (
        <div className="flex items-center gap-6 p-5 bg-white rounded-2xl border border-slate-200">
          <div className="relative w-32 h-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value" stroke="none">
                  {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-900">{stats.percentage}%</span>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Present', val: stats.present, color: 'bg-emerald-500' },
              { label: 'Absent', val: stats.absent, color: 'bg-red-500' },
              { label: 'Leave/Excused', val: stats.leave, color: 'bg-amber-500' },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${r.color}`} />
                <span className="text-sm text-slate-700 font-medium">{r.label}</span>
                <span className="font-bold text-slate-900 ml-auto">{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HistoricalChart({ studentId }: { studentId: string }) {
  const { data: history, loading, error, refetch } = useStudentAttendanceHistory(studentId);

  if (loading) return <Skeleton className="h-48 w-full" />;
  if (error) return <ErrorState message="Unable to load history." onRetry={refetch} />;

  const withData = (history || []).filter((h: any) => h.total > 0);

  if (withData.length === 0) return (
    <EmptyState icon={TrendingDown} title="No historical records" description="Attendance history across sessions will appear here." />
  );

  const chartData = withData.map((h: any) => ({
    name: h.sessionName,
    Attendance: h.percentage ?? 0,
    Present: h.present,
    Absent: h.absent,
  }));

  return (
    <div className="space-y-6">
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
            <Tooltip
              formatter={(value: any) => [`${value}%`, 'Attendance']}
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar dataKey="Attendance" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.Attendance >= 75 ? '#10B981' : entry.Attendance >= 60 ? '#F59E0B' : '#EF4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-slate-900">Academic History</h3>
        {withData.map((record: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-900">{record.sessionName}</p>
              <p className="text-sm text-slate-500">
                {record.present} Present / {record.absent} Absent · {record.total} total days
              </p>
            </div>
            <div className="text-right">
              {record.percentage !== null ? (
                <p className={`text-xl font-black ${record.percentage >= 75 ? 'text-emerald-600' : record.percentage >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                  {record.percentage}%
                </p>
              ) : (
                <Badge variant="default">No data</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StudentAttendancePage() {
  const { data: student, loading: studentLoading, error: studentError } = useCurrentStudent();
  const { data: session, loading: sessionLoading } = useCurrentSession();

  if (studentLoading || sessionLoading) return <LoadingSpinner label="Loading attendance..." />;
  if (studentError) return <div className="p-8"><ErrorState message="Unable to load student profile." /></div>;
  if (!student) return <div className="p-8"><ErrorState message="Student profile not found." /></div>;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Attendance Overview</h1>
        <p className="text-slate-500 text-sm mt-1">{student.firstName} {student.lastName} · {student.admissionNo}</p>
      </div>

      {/* CURRENT SESSION */}
      {session ? (
        <SectionCard title={<span className="flex items-center gap-2"><Calendar size={16} className="text-blue-600" />Current Session — {session.name}</span>}>
          <CurrentSessionStats studentId={student.id} sessionId={session.id} sessionName={session.name} />
        </SectionCard>
      ) : (
        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200">
          <p className="text-amber-800 font-medium">No active academic session found. Please contact admin.</p>
        </div>
      )}

      {/* HISTORICAL */}
      <SectionCard title={<span className="flex items-center gap-2"><TrendingDown size={16} className="text-indigo-600" />Historical Attendance Trend</span>}>
        <HistoricalChart studentId={student.id} />
      </SectionCard>
    </div>
  );
}
