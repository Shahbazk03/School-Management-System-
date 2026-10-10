'use client';

import { useCurrentTeacher, useAllTimetable } from '@/api/hooks';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/ui';
import { Clock, Calendar } from 'lucide-react';
import { useState } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TeacherTimetable() {
  const { data: teacher, loading: teacherLoading } = useCurrentTeacher();
  const { data: timetable, loading, error, refetch } = useAllTimetable();
  const [activeDay, setActiveDay] = useState(new Date().getDay() || 1); // Default to today or Monday if Sunday

  if (teacherLoading || loading) return <LoadingSpinner label="Loading timetable..." />;
  if (error) return <div className="p-8"><ErrorState message="Unable to load timetable." onRetry={refetch} /></div>;

  const mySchedule = (timetable || []).filter((t: any) => t.teacherId === teacher?.id);

  const daySchedule = mySchedule
    .filter((t: any) => t.dayOfWeek === activeDay)
    .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Teaching Schedule</h1>
        <p className="text-sm text-slate-500 mt-1">Your weekly class timetable.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto bg-slate-50 border-b border-slate-200 custom-scrollbar">
          {DAYS.map((day, idx) => {
            const dayNum = idx + 1; // 1 = Monday
            const isActive = activeDay === dayNum;
            return (
              <button
                key={day}
                onClick={() => setActiveDay(dayNum)}
                className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                  isActive ? 'border-emerald-600 text-emerald-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
        
        <div className="p-6">
          {daySchedule.length === 0 ? (
            <EmptyState icon={Calendar} title="No classes" description="You have no classes scheduled to teach on this day." />
          ) : (
            <div className="space-y-3">
              {daySchedule.map((cls: any, i: number) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all">
                  <div className="w-24 shrink-0">
                    <p className="font-black text-slate-900">{cls.startTime}</p>
                    <p className="text-xs text-slate-500 font-bold">{cls.endTime}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg text-emerald-700 mb-1">
                      Class {cls.classSection?.class?.name}-{cls.classSection?.section?.name}
                    </p>
                    <div className="flex gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                        {cls.subject?.subjectName || 'Subject'}
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
    </div>
  );
}
