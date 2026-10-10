'use client';

import { useCurrentParent, useParentChildren, useAllTimetable } from '@/api/hooks';
import { LoadingSpinner, EmptyState, ErrorState, Badge } from '@/components/ui';
import { Calendar, User, ChevronDown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function StudentTimetableView({ student }: { student: any }) {
  const { data: timetable, loading, error, refetch } = useAllTimetable();
  const [activeDay, setActiveDay] = useState(new Date().getDay() || 1);

  const currentEnrollment = student?.enrollments?.find((e: any) => e.academicSession?.isCurrent) 
    || student?.enrollments?.[0];
  const classSectionId = currentEnrollment?.classSectionId;

  const daySchedule = useMemo(() => {
    if (!timetable || !classSectionId) return [];
    return timetable
      .filter((t: any) => t.dayOfWeek === activeDay && t.classSectionId === classSectionId)
      .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
  }, [timetable, activeDay, classSectionId]);

  if (loading) return <LoadingSpinner label="Loading timetable..." />;
  if (error) return <div className="p-8"><ErrorState message="Unable to load timetable." onRetry={refetch} /></div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      <div className="flex overflow-x-auto bg-slate-50 border-b border-slate-200 custom-scrollbar">
        {DAYS.map((day, idx) => {
          const dayNum = idx + 1;
          const isActive = activeDay === dayNum;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(dayNum)}
              className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                isActive ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
      
      <div className="p-6">
        {daySchedule.length === 0 ? (
          <EmptyState icon={Calendar} title="No classes" description="Your child has no classes scheduled for this day." />
        ) : (
          <div className="space-y-3">
            {daySchedule.map((cls: any, i: number) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                <div className="w-24 shrink-0">
                  <p className="font-black text-slate-900">{cls.startTime}</p>
                  <p className="text-xs text-slate-500 font-bold">{cls.endTime}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg text-blue-700 mb-1">{cls.subject?.subjectName || 'Subject'}</p>
                  <div className="flex gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                      {cls.teacher ? `${cls.teacher.firstName} ${cls.teacher.lastName}` : 'TBA'}
                    </span>
                    {cls.room && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                        Room {cls.room}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ParentTimetable() {
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
          <h1 className="text-2xl font-extrabold text-slate-900">Weekly Timetable</h1>
          <p className="text-sm text-slate-500">View your child's class schedule.</p>
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
      {selectedChildId && <StudentTimetableView student={children.find((c: any) => c.id === selectedChildId)} />}
    </div>
  );
}