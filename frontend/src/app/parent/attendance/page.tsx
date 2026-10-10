'use client';

import { useCurrentParent, useParentChildren, useCurrentSession, useStudentAttendanceStats, useStudentAttendanceHistory } from '@/api/hooks';
import { LoadingSpinner, EmptyState, ErrorState, Badge, AttendanceBadge, Skeleton } from '@/components/ui';
import { Calendar, User, CheckCircle2, XCircle, TrendingDown, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

function StudentAttendanceView({ student, session }: { student: any, session: any }) {
  const { data: stats, loading, error, refetch } = useStudentAttendanceStats(student.id, session.id);
  const { data: history, loading: hLoading } = useStudentAttendanceHistory(student.id);

  if (loading || hLoading) return <div className="space-y-4"><Skeleton className="h-48 w-full" /></div>;
  if (error) return <ErrorState message="Unable to load attendance." onRetry={refetch} />;

  const chartData = stats?.status === 'OK' ? [
    { name: 'Present', value: stats.present || 0.01, color: '#10B981' },
    { name: 'Absent', value: stats.absent || 0.01, color: '#EF4444' },
    { name: 'Leave', value: stats.leave || 0.01, color: '#F59E0B' },
  ] : [];

  const historyData = (history || []).filter((h: any) => h.total > 0).map((h: any) => ({
    name: h.sessionName,
    Attendance: h.percentage ?? 0,
    Present: h.present,
    Absent: h.absent,
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center">
        {stats?.status === 'OK' ? (
          <>
            <div className="relative w-40 h-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                    {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900">{stats.percentage}%</span>
              </div>
            </div>
            <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-500 uppercase">Total Days</p>
                <p className="text-3xl font-black text-slate-900">{stats.total}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl">
                <p className="text-xs font-bold text-emerald-700 uppercase">Present</p>
                <p className="text-3xl font-black text-emerald-700">{stats.present}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-xl">
                <p className="text-xs font-bold text-red-700 uppercase">Absent</p>
                <p className="text-3xl font-black text-red-700">{stats.absent}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-xs font-bold text-amber-700 uppercase">Leave</p>
                <p className="text-3xl font-black text-amber-700">{stats.leave}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full py-8 flex flex-col items-center justify-center text-slate-400">
            <Calendar size={48} className="mb-3 opacity-50" />
            <p className="font-bold text-slate-600">No attendance data yet.</p>
          </div>
        )}
      </div>

      {historyData.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><TrendingDown size={18} className="text-indigo-600" /> Attendance History</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyData} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
                <Tooltip formatter={(val: any) => [`${val}%`, 'Attendance']} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="Attendance" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {historyData.map((e, i) => <Cell key={i} fill={e.Attendance >= 75 ? '#10B981' : e.Attendance >= 60 ? '#F59E0B' : '#EF4444'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ParentAttendance() {
  const { data: parent, loading: pLoad } = useCurrentParent();
  const { data: children, loading: cLoad } = useParentChildren(parent?.id || null);
  const { data: session, loading: sLoad } = useCurrentSession();

  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  if (pLoad || cLoad || sLoad) return <LoadingSpinner label="Loading records..." />;
  if (!children || children.length === 0) return <EmptyState icon={User} title="No Children Linked" description="Please contact administration." />;
  
  const selectedChild = children.find((c: any) => c.id === selectedChildId);

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Attendance Records</h1>
          <p className="text-sm text-slate-500">Monitor your child's daily presence.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <select
            className="w-full appearance-none bg-blue-50 border-2 border-blue-200 text-blue-900 text-sm rounded-xl p-3 pr-10 font-bold outline-none focus:ring-4 focus:ring-blue-100 cursor-pointer"
            value={selectedChildId || ''}
            onChange={(e) => setSelectedChildId(e.target.value)}
          >
            {children.map((child: any) => (
              <option key={child.id} value={child.id}>
                {child.firstName} {child.lastName}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-500">
            <ChevronDown size={18} strokeWidth={3} />
          </div>
        </div>
      </div>

      {selectedChild && session ? (
        <StudentAttendanceView student={selectedChild} session={session} />
      ) : (
        <EmptyState title="Loading or Session not found..." />
      )}
    </div>
  );
}
