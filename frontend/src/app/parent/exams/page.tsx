'use client';

import { useCurrentParent, useParentChildren, useAllExams } from '@/api/hooks';
import { LoadingSpinner, EmptyState, ErrorState, Badge, daysFromNow } from '@/components/ui';
import { BookOpen, Calendar as CalendarIcon, User, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

function StudentExamsView({ studentId }: { studentId: string }) {
  const { data: exams, loading, error, refetch } = useAllExams();

  if (loading) return <LoadingSpinner label="Loading examinations..." />;
  if (error) return <div className="p-8"><ErrorState message="Unable to load exams." onRetry={refetch} /></div>;
  if (!exams || exams.length === 0) return <EmptyState icon={BookOpen} title="No Exams Scheduled" description="There are no upcoming or past exams recorded." />;

  const now = new Date();
  const upcoming = exams.filter((e: any) => new Date(e.startDate) >= now).sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const past = exams.filter((e: any) => new Date(e.startDate) < now).sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CalendarIcon size={20} className="text-blue-600" /> Upcoming Exams
        </h2>
        {upcoming.length === 0 ? (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center text-slate-500">No upcoming exams.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcoming.map((exam: any, i: number) => {
              const days = daysFromNow(exam.startDate);
              return (
                <div key={i} className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm shadow-blue-100/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none" />
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <Badge variant={days <= 3 ? 'error' : days <= 7 ? 'warning' : 'info'}>
                      {days === 0 ? 'Starts Today' : `In ${days} Days`}
                    </Badge>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-lg mb-1 relative z-10">{exam.name}</h3>
                  <div className="space-y-2 mt-4 text-sm text-slate-600 relative z-10">
                    <p className="flex justify-between"><span>Start Date:</span> <span className="font-bold text-slate-900">{new Date(exam.startDate).toLocaleDateString()}</span></p>
                    <p className="flex justify-between"><span>End Date:</span> <span className="font-bold text-slate-900">{new Date(exam.endDate).toLocaleDateString()}</span></p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-6 pt-6 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BookOpen size={20} className="text-slate-400" /> Past Exams
        </h2>
        {past.length === 0 ? (
          <div className="text-slate-500 text-sm">No past exams.</div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Name</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {past.map((exam: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{exam.name}</td>
                    <td className="py-3 px-4 text-slate-600 text-sm">{new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4"><Badge variant="default">Completed</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ParentExams() {
  const { data: parent, loading: pLoad } = useCurrentParent();
  const { data: children, loading: cLoad } = useParentChildren(parent?.id || null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) setSelectedChildId(children[0].id);
  }, [children, selectedChildId]);

  if (pLoad || cLoad) return <LoadingSpinner label="Loading..." />;
  if (!children || children.length === 0) return <EmptyState icon={User} title="No Children" />;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Examinations</h1>
          <p className="text-sm text-slate-500">View examination schedules for your child.</p>
        </div>
        <div className="relative w-full md:w-64">
          <select
            className="w-full appearance-none bg-blue-50 border-2 border-blue-200 text-blue-900 text-sm rounded-xl p-3 pr-10 font-bold outline-none focus:ring-4 focus:ring-blue-100 cursor-pointer"
            value={selectedChildId || ''}
            onChange={(e) => setSelectedChildId(e.target.value)}
          >
            {children.map((c: any) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-500">
            <ChevronDown size={18} strokeWidth={3} />
          </div>
        </div>
      </div>
      {selectedChildId && <StudentExamsView studentId={selectedChildId} />}
    </div>
  );
}