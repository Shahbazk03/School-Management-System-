'use client';

import { useCurrentTeacher, useTeacherAssignments } from '@/api/hooks';
import { LoadingSpinner, EmptyState, ErrorState, Badge } from '@/components/ui';
import { BookOpen, Users } from 'lucide-react';
import Link from 'next/link';

export default function TeacherClasses() {
  const { data: teacher, loading: teacherLoading } = useCurrentTeacher();
  const { data: assignments, loading: assignLoading, error, refetch } = useTeacherAssignments(teacher?.id || null);

  if (teacherLoading || assignLoading) return <LoadingSpinner label="Loading assigned classes..." />;
  if (error) return <div className="p-8"><ErrorState message="Unable to load classes." onRetry={refetch} /></div>;

  if (!assignments || assignments.length === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <EmptyState icon={BookOpen} title="No Classes Assigned" description="You have not been assigned to any classes yet." />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Classes</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your assigned classes and subjects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map((assign: any, i: number) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
            <div className={`p-5 border-b ${assign.isClassTeacher ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex justify-between items-start mb-2">
                <Badge variant={assign.isClassTeacher ? 'warning' : 'info'}>
                  {assign.isClassTeacher ? 'Class Teacher' : 'Subject Teacher'}
                </Badge>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Class {assign.classSection?.class?.name}-{assign.classSection?.section?.name}
              </h2>
              <p className="text-sm text-slate-600 font-medium mt-1">{assign.subject?.subjectName || 'General'}</p>
            </div>
            
            <div className="p-5 flex-1 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-500 flex items-center gap-2"><Users size={16} /> Level</span>
                <span className="font-bold text-slate-900">{assign.classSection?.class?.level || 'N/A'}</span>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <Link
                href="/teacher/attendance"
                className="flex-1 text-center py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
              >
                Attendance
              </Link>
              <Link
                href="/teacher/marks"
                className="flex-1 text-center py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
              >
                Marks
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
