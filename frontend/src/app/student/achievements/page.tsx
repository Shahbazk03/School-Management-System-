'use client';

import { useCurrentStudent, useStudentAchievements } from '@/api/hooks';
import { LoadingSpinner, EmptyState, ErrorState, Badge } from '@/components/ui';
import { Award } from 'lucide-react';

export default function StudentAchievements() {
  const { data: student, loading: studentLoading } = useCurrentStudent();
  const { data: achievements, loading, error, refetch } = useStudentAchievements(student?.id || null);

  if (studentLoading || loading) return <LoadingSpinner label="Loading your achievements..." />;
  if (error) return <div className="p-8"><ErrorState message="Unable to load achievements." onRetry={refetch} /></div>;
  
  if (!achievements || achievements.length === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <EmptyState icon={Award} title="No Achievements" description="Keep up the good work! Your awards will appear here." />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Achievements</h1>
        <p className="text-sm text-slate-500 mt-1">A record of your awards and accomplishments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  );
}
