'use client';

import { useState } from 'react';
import { useCurrentTeacher, useTeacherAssignments, useCurrentSession } from '@/api/hooks';
import { apiClient } from '@/api/client';
import { LoadingSpinner, Badge } from '@/components/ui';
import { CheckSquare, User, Check, X, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherAttendance() {
  const { data: teacher, loading: teacherLoading } = useCurrentTeacher();
  const { data: assignments, loading: assignLoading } = useTeacherAssignments(teacher?.id || null);
  const { data: session, loading: sessionLoading } = useCurrentSession();
  
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceState, setAttendanceState] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LEAVE' | 'EXCUSED'>>({});
  
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAlreadyMarked, setIsAlreadyMarked] = useState(false);

  const selectedAssignment = assignments?.find((a: any) => a.id === selectedAssignmentId);
  const selectedClassSectionId = selectedAssignment?.classSectionId;

  const loadStudents = async () => {
    if (!selectedClassSectionId) return;
    
    setLoadingData(true);
    try {
      const enrollRes = await apiClient.get(`/enrollments?classSectionId=${selectedClassSectionId}`);
      const enrolled = enrollRes.data || [];
      
      const stRes = await apiClient.get('/students');
      const allStudents = stRes.data || [];
      
      const classStudents = allStudents.filter((s: any) => 
        enrolled.some((e: any) => e.studentId === s.id)
      ).sort((a: any, b: any) => a.firstName.localeCompare(b.firstName));

      setStudents(classStudents);
      
      // Fetch existing attendance for this date
      const attendanceRes = await apiClient.get(`/attendance/class/${selectedClassSectionId}?date=${date}`);
      const existingAttendance = attendanceRes.data || [];
      setIsAlreadyMarked(existingAttendance.length > 0);

      // Initialize state to PRESENT for all by default, unless already marked
      const initialState: any = {};
      classStudents.forEach((s: any) => {
        const existing = existingAttendance.find((a: any) => a.studentId === s.id);
        initialState[s.id] = existing ? existing.status : 'PRESENT';
      });
      setAttendanceState(initialState);
      
    } catch (err) {
      toast.error('Failed to load students.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async () => {
    if (!session) {
      toast.error('No active academic session found.');
      return;
    }
    
    setSaving(true);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      const promises = students.map(async (student) => {
        const status = attendanceState[student.id];
        try {
          await apiClient.post('/attendance', {
            studentId: student.id,
            classSectionId: selectedClassSectionId,
            academicSessionId: session.id,
            date: new Date(date).toISOString(),
            status: status,
            remarks: ''
          });
          successCount++;
        } catch (e) {
          errorCount++;
        }
      });

      await Promise.all(promises);
      
      if (errorCount === 0) {
        toast.success(`Successfully saved attendance for ${successCount} students.`);
        setIsAlreadyMarked(true);
      } else {
        toast.error(`Saved ${successCount}. Failed ${errorCount}.`);
      }
      
    } catch (err) {
      toast.error('An error occurred while saving attendance.');
    } finally {
      setSaving(false);
    }
  };

  if (teacherLoading || assignLoading || sessionLoading) {
    return <LoadingSpinner label="Loading attendance module..." />;
  }

  const markAll = (status: 'PRESENT' | 'ABSENT' | 'LEAVE') => {
    const newState = { ...attendanceState };
    students.forEach(s => { newState[s.id] = status; });
    setAttendanceState(newState);
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Mark Attendance</h1>
          <p className="text-sm text-slate-500 mt-1">Record daily attendance for your assigned classes.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Class</label>
            <select
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-slate-900 appearance-none"
              value={selectedAssignmentId}
              onChange={(e) => {
                setSelectedAssignmentId(e.target.value);
                setStudents([]);
                setIsAlreadyMarked(false);
              }}
            >
              <option value="">-- Choose Class --</option>
              {assignments?.filter((a: any) => a.isClassTeacher).map((a: any) => (
                <option key={a.id} value={a.id}>
                  Class {a.classSection?.class?.name}-{a.classSection?.section?.name} (Class Teacher)
                </option>
              ))}
              {assignments?.filter((a: any) => !a.isClassTeacher).map((a: any) => (
                <option key={a.id} value={a.id}>
                  Class {a.classSection?.class?.name}-{a.classSection?.section?.name} · {a.subject?.subjectName}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Date</label>
            <input
              type="date"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-slate-900"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setStudents([]);
                setIsAlreadyMarked(false);
              }}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={loadStudents}
              disabled={!selectedAssignmentId || loadingData}
              className="w-full bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loadingData ? <LoadingSpinner label="" /> : <CheckSquare size={18} />}
              Load Register
            </button>
          </div>
        </div>
      </div>

      {students.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="font-bold text-slate-900">
                {selectedAssignment?.classSection?.class?.name}-{selectedAssignment?.classSection?.section?.name}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-slate-500">{new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                {isAlreadyMarked && (
                  <Badge variant="success" className="text-[10px] py-0">Attendance Already Recorded</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => !isAlreadyMarked && markAll('PRESENT')} disabled={isAlreadyMarked} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${isAlreadyMarked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>All Present</button>
              <button onClick={() => !isAlreadyMarked && markAll('ABSENT')} disabled={isAlreadyMarked} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${isAlreadyMarked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>All Absent</button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map((student) => {
                  const status = attendanceState[student.id];
                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                            <User size={14} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{student.firstName} {student.lastName}</span>
                            <span className="text-xs text-slate-500">{student.studentId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => !isAlreadyMarked && setAttendanceState(prev => ({ ...prev, [student.id]: 'PRESENT' }))}
                            disabled={isAlreadyMarked}
                            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${status === 'PRESENT' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-slate-100 text-slate-400'} ${!isAlreadyMarked && status !== 'PRESENT' ? 'hover:bg-emerald-50 hover:text-emerald-500' : ''} ${isAlreadyMarked && status !== 'PRESENT' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Check size={18} strokeWidth={status === 'PRESENT' ? 3 : 2} />
                          </button>
                          <button
                            onClick={() => !isAlreadyMarked && setAttendanceState(prev => ({ ...prev, [student.id]: 'ABSENT' }))}
                            disabled={isAlreadyMarked}
                            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${status === 'ABSENT' ? 'bg-red-500 text-white shadow-md shadow-red-200' : 'bg-slate-100 text-slate-400'} ${!isAlreadyMarked && status !== 'ABSENT' ? 'hover:bg-red-50 hover:text-red-500' : ''} ${isAlreadyMarked && status !== 'ABSENT' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <X size={18} strokeWidth={status === 'ABSENT' ? 3 : 2} />
                          </button>
                          <button
                            onClick={() => !isAlreadyMarked && setAttendanceState(prev => ({ ...prev, [student.id]: 'LEAVE' }))}
                            disabled={isAlreadyMarked}
                            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${status === 'LEAVE' ? 'bg-amber-500 text-white shadow-md shadow-amber-200' : 'bg-slate-100 text-slate-400'} ${!isAlreadyMarked && status !== 'LEAVE' ? 'hover:bg-amber-50 hover:text-amber-500' : ''} ${isAlreadyMarked && status !== 'LEAVE' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Minus size={18} strokeWidth={status === 'LEAVE' ? 3 : 2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <div className="flex gap-4 text-sm font-bold text-slate-600">
              <span className="text-emerald-600">{Object.values(attendanceState).filter(s => s === 'PRESENT').length} Present</span>
              <span className="text-red-600">{Object.values(attendanceState).filter(s => s === 'ABSENT').length} Absent</span>
            </div>
            {!isAlreadyMarked ? (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Submit Attendance'}
              </button>
            ) : (
              <button
                disabled
                className="px-6 py-2.5 bg-slate-200 text-slate-500 rounded-xl font-bold cursor-not-allowed flex items-center gap-2"
              >
                Attendance Recorded
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
