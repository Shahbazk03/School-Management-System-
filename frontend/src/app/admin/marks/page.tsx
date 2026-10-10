'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';

export default function AdminMarksPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  const [students, setStudents] = useState<any[]>([]);
  const [marksData, setMarksData] = useState<Record<string, { theory: string, practical: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [subjectConfig, setSubjectConfig] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      apiClient.get('/academic-sessions').catch(() => ({ data: [] })),
      apiClient.get('/classes').catch(() => ({ data: [] })),
      apiClient.get('/sections').catch(() => ({ data: [] })),
      apiClient.get('/exams').catch(() => ({ data: [] })),
      apiClient.get('/subjects').catch(() => ({ data: [] }))
    ]).then(([sess, cls, sec, ex, sub]) => {
      setSessions(sess.data);
      setClasses(cls.data);
      setSections(sec.data);
      setExams(ex.data);
      setSubjects(sub.data);
      const curr = sess.data.find((s: any) => s.isCurrent);
      if (curr) setSelectedSession(curr.id);
    });
  }, []);

  const handleFetchStudents = async () => {
    if (!selectedSession || !selectedClass || !selectedSection || !selectedExam || !selectedSubject) {
      toast.error('Please select all filters');
      return;
    }

    const sub = subjects.find(s => s.id === selectedSubject);
    setSubjectConfig(sub);

    setLoading(true);
    try {
      const res = await apiClient.get('/students');
      const classStudents = (res.data || []).filter((s: any) => 
        s.enrollments?.some((e: any) => 
          e.academicSessionId === selectedSession && 
          e.classSection?.classId === selectedClass && 
          e.classSection?.sectionId === selectedSection
        )
      );
      setStudents(classStudents);

      // Fetch existing marks
      const marksRes = await apiClient.get('/marks');
      const existing = (marksRes.data || []).filter((m: any) => 
        m.examId === selectedExam && 
        m.subjectId === selectedSubject
      );

      const map: Record<string, any> = {};
      existing.forEach((m: any) => {
        map[m.studentId] = { theory: m.theoryMarks?.toString() || '', practical: m.practicalMarks?.toString() || '' };
      });
      setMarksData(map);
      
      if (existing.length > 0) toast.success(`Loaded ${existing.length} existing records`);

    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId: string, type: 'theory' | 'practical', value: string) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { theory: '', practical: '' }),
        [type]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!subjectConfig) return;

    // Validate marks against max marks
    const invalid = students.find(s => {
      const mark = marksData[s.id];
      if (!mark) return false;
      const th = Number(mark.theory);
      const pr = Number(mark.practical);
      if (th > subjectConfig.theoryMarks) return true;
      if (pr > subjectConfig.practicalMarks) return true;
      return false;
    });

    if (invalid) {
      toast.error(`Error: Marks exceed maximum allowed marks for ${invalid.firstName} ${invalid.lastName}. Theory Max: ${subjectConfig.theoryMarks}, Practical Max: ${subjectConfig.practicalMarks}`);
      return;
    }

    const records = students
      .filter(s => marksData[s.id]?.theory !== '' || marksData[s.id]?.practical !== '')
      .map(s => ({
        studentId: s.id,
        examId: selectedExam,
        subjectId: selectedSubject,
        theoryMarks: marksData[s.id].theory ? Number(marksData[s.id].theory) : null,
        practicalMarks: marksData[s.id].practical ? Number(marksData[s.id].practical) : null,
      }));

    if (records.length === 0) {
      toast.error('No marks entered');
      return;
    }

    setSaving(true);
    try {
      // Assuming a bulk endpoint or looping
      let count = 0;
      for (const record of records) {
        try {
          await apiClient.post('/marks', record);
          count++;
        } catch { }
      }
      toast.success(`Saved marks for ${count} students`);
    } catch (err) {
      toast.error('Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Marks Entry</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Exam & Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Session</label>
              <select value={selectedSession} onChange={e => setSelectedSession(e.target.value)} className="w-full p-2 border rounded">
                <option value="">Select...</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Exam</label>
              <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)} className="w-full p-2 border rounded">
                <option value="">Select...</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Class</label>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full p-2 border rounded">
                <option value="">Select...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Section</label>
              <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="w-full p-2 border rounded">
                <option value="">Select...</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full p-2 border rounded">
                <option value="">Select...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
              </select>
            </div>
            <div>
              <button onClick={handleFetchStudents} disabled={loading} className="w-full p-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50">
                {loading ? 'Loading...' : 'Load Students'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {students.length > 0 && subjectConfig && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Enter Marks</CardTitle>
              <div className="text-sm font-medium bg-blue-50 text-blue-800 px-3 py-1 rounded">
                Max Theory: {subjectConfig.theoryMarks} | Max Practical: {subjectConfig.practicalMarks}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm text-left border">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium border-r">Student Name</th>
                  <th className="px-4 py-3 font-medium border-r w-32 text-center">Theory Marks</th>
                  <th className="px-4 py-3 font-medium w-32 text-center">Practical Marks</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => {
                  const th = marksData[student.id]?.theory || '';
                  const pr = marksData[student.id]?.practical || '';
                  
                  const thError = Number(th) > subjectConfig.theoryMarks;
                  const prError = Number(pr) > subjectConfig.practicalMarks;

                  return (
                    <tr key={student.id} className="border-b">
                      <td className="px-4 py-2 border-r font-medium">{student.firstName} {student.lastName}</td>
                      <td className="px-4 py-2 border-r">
                        <input 
                          type="number" 
                          min="0" 
                          max={subjectConfig.theoryMarks} 
                          value={th}
                          onChange={e => handleMarkChange(student.id, 'theory', e.target.value)}
                          className={`w-full p-1 border rounded text-center ${thError ? 'border-red-500 bg-red-50' : ''}`}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="number" 
                          min="0" 
                          max={subjectConfig.practicalMarks} 
                          value={pr}
                          onChange={e => handleMarkChange(student.id, 'practical', e.target.value)}
                          className={`w-full p-1 border rounded text-center ${prError ? 'border-red-500 bg-red-50' : ''}`}
                          disabled={subjectConfig.practicalMarks === 0}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex justify-end mt-6">
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded font-bold shadow hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Marks'}
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
