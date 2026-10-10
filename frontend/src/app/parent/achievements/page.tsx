'use client';

import { useCurrentParent, useParentChildren, useStudentAchievements } from '@/api/hooks';
import { LoadingSpinner, EmptyState, ErrorState, Badge } from '@/components/ui';
import { Award, User, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

function StudentAchievementsView({ studentId }: { studentId: string }) {
  const { data: achievements, loading, error, refetch } = useStudentAchievements(studentId);

  if (loading) return <LoadingSpinner label="Loading achievements..." />;
  if (error) return <div className="p-8"><ErrorState message="Unable to load achievements." onRetry={refetch} /></div>;
  if (!achievements || achievements.length === 0) return <EmptyState icon={Award} title="No Achievements" description="Awards and accomplishments will appear here." />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
      {achievements.map((ach: any, i: number) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-yellow-200 shadow-sm shadow-yellow-100/50 flex gap-5 hover:-translate-y-1 transition-transform">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center shrink-0 text-white shadow-inner">
            <Award size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="warning">{ach.category}</Badge>
              <span className="text-xs text-slate-400 font-bold">{new Date(ach.date).toLocaleDateString()}</span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">{ach.title}</h3>
            {ach.description && <p className="text-sm text-slate-600 mt-2">{ach.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ParentAchievements() {
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
          <h1 className="text-2xl font-extrabold text-slate-900">Student Achievements</h1>
          <p className="text-sm text-slate-500">View your child's awards and accomplishments.</p>
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
      {selectedChildId && <StudentAchievementsView studentId={selectedChildId} />}
    </div>
  );
}