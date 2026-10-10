'use client';

import { useAuth } from '@/auth/AuthContext';
import { useCurrentTeacher } from '@/api/hooks';
import { LoadingSpinner, ErrorState, Badge } from '@/components/ui';
import { User, Mail, Briefcase, Hash } from 'lucide-react';

export default function TeacherProfile() {
  const { user } = useAuth();
  const { data: teacher, loading, error, refetch } = useCurrentTeacher();

  if (loading) return <LoadingSpinner label="Loading profile..." />;
  if (error) return <div className="p-8"><ErrorState message="Unable to load profile." onRetry={refetch} /></div>;
  if (!teacher) return <div className="p-8"><ErrorState message="Profile not found." /></div>;

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your professional information and account settings.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-700"></div>
        <div className="px-8 pb-8 relative">
          <div className="w-24 h-24 rounded-2xl bg-white p-1 absolute -top-12 shadow-md">
            <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
              <User size={48} />
            </div>
          </div>
          <div className="pt-16">
            <h2 className="text-2xl font-extrabold text-slate-900">{teacher.firstName} {teacher.lastName}</h2>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="success">Teacher ID: {teacher.teacherId}</Badge>
              {teacher.employeeId && <Badge variant="default">Emp: {teacher.employeeId}</Badge>}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 p-8">
          <h3 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Professional Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0"><Mail size={18} /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Email Address</p>
                <p className="text-sm font-medium text-slate-900">{teacher.email || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0"><Briefcase size={18} /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Qualifications</p>
                <p className="text-sm font-medium text-slate-900">{teacher.qualifications || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0"><Hash size={18} /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">System Permanent ID</p>
                <p className="text-sm font-mono text-slate-900">{teacher.permanentId || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
