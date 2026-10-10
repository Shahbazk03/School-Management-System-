'use client';

import { useAuth } from '@/auth/AuthContext';
import { useCurrentStudent } from '@/api/hooks';
import { LoadingSpinner, ErrorState, Badge } from '@/components/ui';
import { User, Mail, Calendar, Hash, Building2 } from 'lucide-react';

export default function StudentProfile() {
  const { user } = useAuth();
  const { data: student, loading, error, refetch } = useCurrentStudent();

  if (loading) return <LoadingSpinner label="Loading profile..." />;
  if (error) return <div className="p-8"><ErrorState message="Unable to load profile." onRetry={refetch} /></div>;
  if (!student) return <div className="p-8"><ErrorState message="Profile not found." /></div>;

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your personal information and account settings.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="px-8 pb-8 relative">
          <div className="w-24 h-24 rounded-2xl bg-white p-1 absolute -top-12 shadow-md">
            <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
              <User size={48} />
            </div>
          </div>
          <div className="pt-16">
            <h2 className="text-2xl font-extrabold text-slate-900">{student.firstName} {student.lastName}</h2>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="info">Student ID: {student.studentId}</Badge>
              {student.admissionNo && <Badge variant="default">Adm: {student.admissionNo}</Badge>}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 p-8">
          <h3 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0"><Mail size={18} /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Email Address</p>
                <p className="text-sm font-medium text-slate-900">{student.email || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0"><Calendar size={18} /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Date of Birth</p>
                <p className="text-sm font-medium text-slate-900">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0"><User size={18} /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Gender</p>
                <p className="text-sm font-medium text-slate-900">{student.gender || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0"><Hash size={18} /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">System Permanent ID</p>
                <p className="text-sm font-mono text-slate-900">{student.permanentId}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 p-8 bg-slate-50">
          <h3 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Enrollment History</h3>
          <div className="space-y-4">
            {student.enrollments?.map((enrollment: any, i: number) => (
              <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Building2 size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">Class {enrollment.classSection?.class?.name}-{enrollment.classSection?.section?.name}</p>
                  <p className="text-sm text-slate-500">Academic Session: {enrollment.academicSession?.name}</p>
                </div>
                {enrollment.academicSession?.isCurrent && (
                  <Badge variant="success">Current</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
