'use client';

import { useState, useEffect } from 'react';
import { useCurrentTeacher, useTeacherAssignments, useAllExams } from '@/api/hooks';
import { apiClient } from '@/api/client';
import { LoadingSpinner, ErrorState, EmptyState, Badge } from '@/components/ui';
import { Save, AlertCircle, BookOpen, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function TeacherMarksEntry() {
  const { data: teacher, loading: teacherLoading } = useCurrentTeacher();
  const { data: assignments, loading: assignLoading } = useTeacherAssignments(teacher?.id || null);
  const { data: exams, loading: examsLoading } = useAllExams();
  
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  
  const [students, setStudents] = useState<any[]>([]);
  const [existingMarks, setExistingMarks] = useState<Record<string, any>>({});
  
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  // Selected details
  const selectedAssignment = assignments?.find((a: any) => a.id === selectedAssignmentId);
  const selectedClassSectionId = selectedAssignment?.classSectionId;
  const selectedSubjectId = selectedAssignment?.subjectId;

  const loadStudentsAndMarks = async () => {
    if (!selectedClassSectionId || !selectedExamId || !selectedSubjectId) return;
    
    setLoadingData(true);
    try {
      // 1. Get enrollments for the class section to find students
      const enrollRes = await apiClient.get(`/enrollments?classSectionId=${selectedClassSectionId}`);
      const enrolled = enrollRes.data || [];
      
      // Since generic get all returns full list, let's just fetch all students and filter locally
      const stRes = await apiClient.get('/students');
      const allStudents = stRes.data || [];
      
      const classStudents = allStudents.filter((s: any) => 
        enrolled.some((e: any) => e.studentId === s.id)
      ).sort((a: any, b: any) => a.firstName.localeCompare(b.firstName));

      setStudents(classStudents);

      // 2. Fetch existing marks for these students for this exam
      const marksMap: Record<string, any> = {};
      
      await Promise.all(
        classStudents.map(async (student: any) => {
          try {
            const marksRes = await apiClient.get(`/marks/student/${student.id}/exam/${selectedExamId}`);
            // Find the mark specifically for this subject
            const subjectMark = marksRes.data.find((m: any) => m.examSubject?.subjectId === selectedSubjectId);
            if (subjectMark) {
              marksMap[student.id] = subjectMark;
            }
          } catch (e) {
            // ignore if not found
          }
        })
      );
      
      setExistingMarks(marksMap);
      
      // Reset form with existing marks
      const defaultValues: any = {};
      classStudents.forEach((s: any) => {
        if (marksMap[s.id]) {
          defaultValues[`marks_${s.id}`] = marksMap[s.id].marksObtained;
        }
      });
      reset(defaultValues);

    } catch (err) {
      toast.error('Failed to load students and marks data.');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!selectedExamId || !selectedSubjectId) {
      toast.error('Missing exam or subject information.');
      return;
    }
    
    setSaving(true);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      // We must find the specific ExamSubject ID from the backend to save the mark.
      // Wait, the backend requires `examSubjectId`. We know the `examId` and `subjectId`.
      // Let's get the exam details to find the examSubjectId.
      const examRes = await apiClient.get(`/exams/${selectedExamId}`);
      const examDetails = examRes.data;
      const examSubject = examDetails.examSubjects?.find((es: any) => es.subjectId === selectedSubjectId);
      
      if (!examSubject) {
        toast.error('This subject is not part of the selected examination.');
        setSaving(false);
        return;
      }
      
      const examSubjectId = examSubject.id;

      const promises = students.map(async (student) => {
        const val = data[`marks_${student.id}`];
        if (val !== undefined && val !== '') {
          try {
            await apiClient.post('/marks', {
              studentId: student.id,
              examSubjectId: examSubjectId,
              marksObtained: parseFloat(val),
            });
            successCount++;
          } catch (e) {
            errorCount++;
          }
        }
      });

      await Promise.all(promises);
      
      if (errorCount === 0) {
        toast.success(`Successfully saved marks for ${successCount} students.`);
      } else {
        toast.error(`Saved ${successCount} marks. Failed to save ${errorCount}. Max marks exceeded?`);
      }
      
      // Reload to reflect state
      loadStudentsAndMarks();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'An error occurred while saving marks.');
    } finally {
      setSaving(false);
    }
  };

  if (teacherLoading || assignLoading || examsLoading) {
    return <LoadingSpinner label="Loading marks entry..." />;
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Enter Student Marks</h1>
          <p className="text-sm text-slate-500 mt-1">Record marks for your assigned classes and subjects.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Your Class & Subject</label>
            <select
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-900 appearance-none"
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
            >
              <option value="">-- Choose Assignment --</option>
              {assignments?.map((a: any) => (
                <option key={a.id} value={a.id}>
                  Class {a.classSection?.class?.name}-{a.classSection?.section?.name} · {a.subject?.subjectName}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Examination</label>
            <select
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-900 appearance-none"
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
            >
              <option value="">-- Choose Exam --</option>
              {exams?.map((e: any) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadStudentsAndMarks}
              disabled={!selectedAssignmentId || !selectedExamId || loadingData}
              className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loadingData ? <LoadingSpinner label="" /> : <BookOpen size={18} />}
              Load Students
            </button>
          </div>
        </div>
      </div>

      {students.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-900">
                {selectedAssignment?.classSection?.class?.name}-{selectedAssignment?.classSection?.section?.name}
              </p>
              <p className="text-sm text-slate-500">Subject: {selectedAssignment?.subject?.subjectName}</p>
            </div>
            <Badge variant="info">{students.length} Students</Badge>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Student ID</th>
                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Current Mark</th>
                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-48 text-right">Enter Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <User size={14} />
                          </div>
                          <span className="font-bold text-slate-900">{student.firstName} {student.lastName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 font-mono text-xs text-slate-500">{student.studentId}</td>
                      <td className="py-3 px-6">
                        {existingMarks[student.id] ? (
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                            {existingMarks[student.id].marksObtained}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="py-3 px-6 text-right">
                        <input
                          type="number"
                          step="0.5"
                          {...register(`marks_${student.id}`)}
                          className="w-32 px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-right font-bold transition-shadow"
                          placeholder="0.0"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setStudents([]); reset(); }}
                className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? 'Saving...' : <><Save size={18} /> Save All Marks</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
