'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';

export default function AdminReportCardsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  
  const [students, setStudents] = useState<any[]>([]);
  const [reportCards, setReportCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiClient.get('/academic-sessions').catch(() => ({ data: [] })),
      apiClient.get('/classes').catch(() => ({ data: [] })),
      apiClient.get('/sections').catch(() => ({ data: [] })),
      apiClient.get('/exams').catch(() => ({ data: [] }))
    ]).then(([sess, cls, sec, ex]) => {
      setSessions(sess.data);
      setClasses(cls.data);
      setSections(sec.data);
      setExams(ex.data);
    });
  }, []);

  const handleFetchStudents = async () => {
    if (!selectedSession || !selectedClass || !selectedSection || !selectedExam) {
      toast.error('Please select all filters');
      return;
    }
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

      const rcRes = await apiClient.get('/report-cards', { params: { examId: selectedExam, academicSessionId: selectedSession }});
      setReportCards(rcRes.data || []);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const generateReportCard = async (studentId: string) => {
    setGenerating(studentId);
    try {
      const res = await apiClient.post('/report-cards/generate', {
        studentId,
        examId: selectedExam,
        academicSessionId: selectedSession,
      });
      toast.success('Report card generated successfully');
      handleFetchStudents(); // Refresh to show download button
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to generate report card');
    } finally {
      setGenerating(null);
    }
  };

  const generateBulk = async () => {
    if(!confirm('This will generate report cards for all students in this list. Continue?')) return;
    
    let successes = 0;
    for(const student of students) {
      setGenerating(student.id);
      try {
        await apiClient.post('/report-cards/generate', {
          studentId: student.id,
          examId: selectedExam,
          academicSessionId: selectedSession,
        });
        successes++;
      } catch (e) {
        // Continue to next on error
      }
    }
    setGenerating(null);
    toast.success(`Generated ${successes}/${students.length} report cards.`);
    handleFetchStudents(); // Refresh
  };

  const handleDownload = async (student: any) => {
    const rc = reportCards.find(r => r.studentId === student.id);
    if (!rc) {
      toast.error('Generate report card first');
      return;
    }
    try {
      toast.loading('Generating PDF...', { id: 'pdf' });
      const res = await apiClient.post(`/report-cards/pdf`, {
        studentId: rc.studentId,
        examId: rc.examId,
        reportCardId: rc.id
      }, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${student.firstName}_ReportCard.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success('Downloaded!', { id: 'pdf' });
    } catch (e) {
      toast.error('Failed to generate PDF', { id: 'pdf' });
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Report Cards Generation</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Exam & Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
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
              <button onClick={handleFetchStudents} disabled={loading} className="w-full p-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50">
                {loading ? 'Loading...' : 'Load Students'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {students.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Student List</CardTitle>
            <button onClick={generateBulk} disabled={!!generating} className="px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 disabled:opacity-50">
              Generate All Report Cards
            </button>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm text-left border">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium border-r">Student Name</th>
                  <th className="px-4 py-3 font-medium border-r">Admission No</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => {
                  const hasRc = reportCards.some(r => r.studentId === student.id);
                  return (
                  <tr key={student.id} className="border-b">
                    <td className="px-4 py-3 border-r font-medium">{student.firstName} {student.lastName}</td>
                    <td className="px-4 py-3 border-r text-gray-500">{student.admissionNo}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {hasRc && (
                        <button 
                          onClick={() => handleDownload(student)}
                          className="text-xs px-3 py-1 bg-green-100 text-green-700 font-bold rounded hover:bg-green-200"
                        >
                          Download PDF
                        </button>
                      )}
                      <button 
                        onClick={() => generateReportCard(student.id)}
                        disabled={!!generating}
                        className="text-xs px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded hover:bg-blue-200 disabled:opacity-50"
                      >
                        {generating === student.id ? 'Generating...' : (hasRc ? 'Regenerate' : 'Generate Individual')}
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
