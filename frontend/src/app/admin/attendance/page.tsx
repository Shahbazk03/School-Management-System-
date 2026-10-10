'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';
import { CheckSquare, UserCheck, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw, Calendar, Users, Filter } from 'lucide-react';

export default function AdminAttendancePage() {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'corrections'>('students');

  // --- Student Attendance State ---
  const [sessions, setSessions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: string; remarks: string }>>({});
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentSaving, setStudentSaving] = useState(false);

  // --- Teacher Attendance State ---
  const [teachers, setTeachers] = useState<any[]>([]);
  const [teacherDate, setTeacherDate] = useState(new Date().toISOString().split('T')[0]);
  const [teacherAttendance, setTeacherAttendance] = useState<Record<string, { status: string; checkIn: string; checkOut: string; remarks: string }>>({});
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherSaving, setTeacherSaving] = useState(false);

  // --- Corrections State ---
  const [corrections, setCorrections] = useState<any[]>([]);
  const [correctionLoading, setCorrectionLoading] = useState(false);
  const [correctionFilter, setCorrectionFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  useEffect(() => {
    // Initial fetch of sessions, classes, sections
    Promise.all([
      apiClient.get('/academic-sessions').catch(() => ({ data: [] })),
      apiClient.get('/classes').catch(() => ({ data: [] })),
      apiClient.get('/sections').catch(() => ({ data: [] })),
    ]).then(([sessRes, clsRes, secRes]) => {
      setSessions(sessRes.data || []);
      setClasses(clsRes.data || []);
      setSections(secRes.data || []);
      
      const currentSession = (sessRes.data || []).find((s: any) => s.isCurrent);
      if (currentSession) setSelectedSession(currentSession.id);
      else if (sessRes.data?.length) setSelectedSession(sessRes.data[0].id);

      if (clsRes.data?.length) setSelectedClass(clsRes.data[0].id);
      if (secRes.data?.length) setSelectedSection(secRes.data[0].id);
    });
  }, []);

  // Fetch Student Attendance
  const handleFetchStudents = async () => {
    if (!selectedSession || !selectedClass || !selectedSection || !selectedDate) {
      toast.error('Please select Session, Class, Section, and Date');
      return;
    }
    
    setStudentLoading(true);
    try {
      // Find class section if available
      const cls = classes.find(c => c.id === selectedClass);
      const csMatch = cls?.classSections?.find((cs: any) => cs.sectionId === selectedSection);
      const classSectionId = csMatch ? csMatch.id : `${selectedClass}-${selectedSection}`;

      // Fetch students
      const res = await apiClient.get('/students');
      const allStudents = res.data || [];
      setStudents(allStudents);

      // Fetch existing attendance records
      const attRes = await apiClient.get('/attendance').catch(() => ({ data: [] }));
      const existing = (attRes.data || []).filter((a: any) => 
        a.date.startsWith(selectedDate) && 
        a.academicSessionId === selectedSession
      );

      const map: Record<string, { status: string; remarks: string }> = {};
      allStudents.forEach((s: any) => {
        const found = existing.find((e: any) => e.studentId === s.id);
        map[s.id] = {
          status: found ? found.status : 'PRESENT',
          remarks: found?.remarks || '',
        };
      });
      setAttendanceData(map);
      toast.success(`Loaded ${allStudents.length} students`);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setStudentLoading(false);
    }
  };

  const handleStudentStatusChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { remarks: '' }),
        status,
      },
    }));
  };

  const markAllStudents = (status: string) => {
    const newMap: Record<string, { status: string; remarks: string }> = {};
    students.forEach(s => {
      newMap[s.id] = {
        status,
        remarks: attendanceData[s.id]?.remarks || '',
      };
    });
    setAttendanceData(newMap);
    toast.success(`Marked all as ${status}`);
  };

  const handleSaveStudentAttendance = async () => {
    if (!students.length) return;
    setStudentSaving(true);
    try {
      const cls = classes.find(c => c.id === selectedClass);
      const csMatch = cls?.classSections?.find((cs: any) => cs.sectionId === selectedSection);
      const classSectionId = csMatch ? csMatch.id : `${selectedClass}-${selectedSection}`;

      let count = 0;
      for (const s of students) {
        const item = attendanceData[s.id];
        await apiClient.post('/attendance', {
          studentId: s.id,
          academicSessionId: selectedSession,
          classSectionId,
          date: new Date(selectedDate).toISOString(),
          status: item?.status || 'PRESENT',
          remarks: item?.remarks || '',
        });
        count++;
      }
      toast.success(`Successfully saved attendance for ${count} students`);
    } catch {
      toast.error('Error saving attendance records');
    } finally {
      setStudentSaving(false);
    }
  };

  // Fetch Teacher Attendance
  const loadTeachers = async () => {
    setTeacherLoading(true);
    try {
      const [tRes, attRes] = await Promise.all([
        apiClient.get('/teachers').catch(() => ({ data: [] })),
        apiClient.get('/teacher-attendance').catch(() => ({ data: [] })),
      ]);
      const teacherList = tRes.data || [];
      setTeachers(teacherList);

      const existingForDate = (attRes.data || []).filter((a: any) => a.date?.startsWith(teacherDate));
      const map: Record<string, any> = {};
      teacherList.forEach((t: any) => {
        const ex = existingForDate.find((a: any) => a.teacherId === t.id);
        map[t.id] = {
          status: ex?.status || 'PRESENT',
          checkIn: ex?.checkIn ? new Date(ex.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '08:00',
          checkOut: ex?.checkOut ? new Date(ex.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '15:30',
          remarks: ex?.remarks || '',
        };
      });
      setTeacherAttendance(map);
    } catch {
      toast.error('Failed to load teacher attendance');
    } finally {
      setTeacherLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'teachers') {
      loadTeachers();
    }
  }, [activeTab, teacherDate]);

  const handleTeacherStatusChange = (teacherId: string, status: string) => {
    setTeacherAttendance(prev => ({
      ...prev,
      [teacherId]: {
        ...(prev[teacherId] || { checkIn: '08:00', checkOut: '15:30', remarks: '' }),
        status,
      },
    }));
  };

  const handleSaveTeacherAttendance = async () => {
    if (!teachers.length) return;
    setTeacherSaving(true);
    try {
      const records = teachers.map(t => {
        const val = teacherAttendance[t.id] || { status: 'PRESENT', checkIn: '08:00', checkOut: '15:30', remarks: '' };
        return {
          teacherId: t.id,
          date: new Date(teacherDate).toISOString(),
          status: val.status,
          checkIn: val.checkIn ? new Date(`${teacherDate}T${val.checkIn}:00`).toISOString() : null,
          checkOut: val.checkOut ? new Date(`${teacherDate}T${val.checkOut}:00`).toISOString() : null,
          remarks: val.remarks,
        };
      });

      await apiClient.post('/teacher-attendance/bulk', { records });
      toast.success(`Saved staff attendance for ${teachers.length} teachers`);
    } catch {
      toast.error('Failed to save staff attendance');
    } finally {
      setTeacherSaving(false);
    }
  };

  // Fetch Correction Requests
  const loadCorrections = async () => {
    setCorrectionLoading(true);
    try {
      const res = await apiClient.get('/attendance/correction-requests');
      setCorrections(res.data || []);
    } catch {
      toast.error('Failed to load correction requests');
    } finally {
      setCorrectionLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'corrections') {
      loadCorrections();
    }
  }, [activeTab]);

  const handleApproveCorrection = async (id: string) => {
    try {
      await apiClient.patch(`/attendance/correction-approve/${id}`);
      toast.success('Correction Approved & Attendance Updated');
      loadCorrections();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve');
    }
  };

  const handleRejectCorrection = async (id: string) => {
    const comment = prompt('Enter rejection reason (optional):');
    if (comment === null) return;
    try {
      await apiClient.patch(`/attendance/correction-reject/${id}`, { comment });
      toast.success('Correction Request Rejected');
      loadCorrections();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reject');
    }
  };

  // Student summary calculations
  const totalStudents = students.length;
  const presentCount = Object.values(attendanceData).filter(v => v.status === 'PRESENT').length;
  const absentCount = Object.values(attendanceData).filter(v => v.status === 'ABSENT').length;
  const lateCount = Object.values(attendanceData).filter(v => v.status === 'LATE').length;
  const leaveCount = Object.values(attendanceData).filter(v => v.status === 'LEAVE' || v.status === 'HALF_DAY').length;
  const attendanceRate = totalStudents > 0 ? Math.round(((presentCount + lateCount) / totalStudents) * 100) : 0;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Attendance Command Center</h1>
          <p className="text-slate-500 text-sm mt-1">Manage student roll-call, staff attendance, and review parent/teacher correction requests.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'students' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={16} /> Student Attendance
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'teachers' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck size={16} /> Staff Attendance
          </button>
          <button
            onClick={() => setActiveTab('corrections')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'corrections' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock size={16} /> Corrections
            {corrections.filter(c => c.status === 'PENDING').length > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-black">
                {corrections.filter(c => c.status === 'PENDING').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: STUDENT ATTENDANCE */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter size={18} className="text-blue-600" /> Select Academic Criteria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Session</label>
                  <select 
                    value={selectedSession} 
                    onChange={e => setSelectedSession(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="">Select Session...</option>
                    {sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.isCurrent ? '(Current)' : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Class</label>
                  <select 
                    value={selectedClass} 
                    onChange={e => setSelectedClass(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="">Select Class...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Section</label>
                  <select 
                    value={selectedSection} 
                    onChange={e => setSelectedSection(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="">Select Section...</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date</label>
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div>
                  <button 
                    onClick={handleFetchStudents}
                    disabled={studentLoading}
                    className="w-full p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {studentLoading ? <RefreshCw size={16} className="animate-spin" /> : <Users size={16} />}
                    {studentLoading ? 'Loading...' : 'Load Roll Call'}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {students.length > 0 && (
            <>
              {/* Daily Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase">Total Enrolled</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{totalStudents}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
                  <p className="text-xs font-bold text-emerald-700 uppercase">Present</p>
                  <p className="text-2xl font-black text-emerald-800 mt-1">{presentCount}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 shadow-sm">
                  <p className="text-xs font-bold text-red-700 uppercase">Absent</p>
                  <p className="text-2xl font-black text-red-800 mt-1">{absentCount}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm">
                  <p className="text-xs font-bold text-amber-700 uppercase">Late / Leave</p>
                  <p className="text-2xl font-black text-amber-800 mt-1">{lateCount + leaveCount}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 shadow-sm">
                  <p className="text-xs font-bold text-blue-700 uppercase">Attendance Rate</p>
                  <p className="text-2xl font-black text-blue-800 mt-1">{attendanceRate}%</p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase mr-2">Quick Actions:</span>
                  <button
                    onClick={() => markAllStudents('PRESENT')}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    Mark All Present
                  </button>
                  <button
                    onClick={() => markAllStudents('ABSENT')}
                    className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    Mark All Absent
                  </button>
                </div>
                <button
                  onClick={handleSaveStudentAttendance}
                  disabled={studentSaving}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50 text-sm flex items-center gap-2"
                >
                  {studentSaving ? <RefreshCw size={16} className="animate-spin" /> : <CheckSquare size={16} />}
                  {studentSaving ? 'Saving Records...' : 'Save All Records'}
                </button>
              </div>

              {/* Attendance Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                        <tr>
                          <th className="px-4 py-3 font-bold w-16">#</th>
                          <th className="px-4 py-3 font-bold">Student</th>
                          <th className="px-4 py-3 font-bold">Admission ID</th>
                          <th className="px-4 py-3 font-bold text-center">Status</th>
                          <th className="px-4 py-3 font-bold">Remarks / Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.map((student, idx) => {
                          const currentStatus = attendanceData[student.id]?.status || 'PRESENT';
                          return (
                            <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-4 py-3 text-slate-400 font-mono text-xs">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <div className="font-bold text-slate-900">{student.firstName} {student.lastName}</div>
                                <div className="text-xs text-slate-500 font-mono">{student.admissionNo}</div>
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-slate-600">{student.permanentId}</td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center gap-1.5">
                                  {[
                                    { id: 'PRESENT', label: 'P', color: 'bg-emerald-600 text-white', inactive: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
                                    { id: 'ABSENT', label: 'A', color: 'bg-red-600 text-white', inactive: 'bg-red-50 text-red-700 border border-red-200' },
                                    { id: 'LATE', label: 'L', color: 'bg-amber-600 text-white', inactive: 'bg-amber-50 text-amber-700 border border-amber-200' },
                                    { id: 'HALF_DAY', label: 'HD', color: 'bg-purple-600 text-white', inactive: 'bg-purple-50 text-purple-700 border border-purple-200' },
                                    { id: 'LEAVE', label: 'LV', color: 'bg-slate-600 text-white', inactive: 'bg-slate-100 text-slate-700 border border-slate-200' },
                                  ].map(btn => (
                                    <button
                                      key={btn.id}
                                      type="button"
                                      onClick={() => handleStudentStatusChange(student.id, btn.id)}
                                      className={`w-9 h-8 rounded-lg text-xs font-black transition-all ${
                                        currentStatus === btn.id ? btn.color + ' shadow-sm scale-105' : btn.inactive + ' opacity-70 hover:opacity-100'
                                      }`}
                                      title={btn.id}
                                    >
                                      {btn.label}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  placeholder="Optional remark..."
                                  value={attendanceData[student.id]?.remarks || ''}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setAttendanceData(prev => ({
                                      ...prev,
                                      [student.id]: {
                                        ...(prev[student.id] || { status: 'PRESENT' }),
                                        remarks: val,
                                      },
                                    }));
                                  }}
                                  className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* TAB 2: STAFF & TEACHER ATTENDANCE */}
      {activeTab === 'teachers' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="text-blue-600" size={20} />
                <span className="text-sm font-bold text-slate-700">Staff Attendance Date:</span>
                <input 
                  type="date" 
                  value={teacherDate} 
                  onChange={e => setTeacherDate(e.target.value)}
                  className="p-2 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleSaveTeacherAttendance}
                disabled={teacherSaving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50 text-sm flex items-center gap-2"
              >
                {teacherSaving ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {teacherSaving ? 'Saving...' : 'Save Staff Attendance'}
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="px-4 py-3 font-bold">Teacher Name</th>
                      <th className="px-4 py-3 font-bold">Employee ID</th>
                      <th className="px-4 py-3 font-bold">Department</th>
                      <th className="px-4 py-3 font-bold text-center">Status</th>
                      <th className="px-4 py-3 font-bold">Check In / Out</th>
                      <th className="px-4 py-3 font-bold">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teacherLoading ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading staff records...</td></tr>
                    ) : teachers.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No teachers found.</td></tr>
                    ) : (
                      teachers.map(teacher => {
                        const cur = teacherAttendance[teacher.id] || { status: 'PRESENT', checkIn: '08:00', checkOut: '15:30', remarks: '' };
                        return (
                          <tr key={teacher.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-900">{teacher.firstName} {teacher.lastName}</div>
                              <div className="text-xs text-slate-500">{teacher.email || teacher.mobile}</div>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-600">{teacher.employeeId}</td>
                            <td className="px-4 py-3">
                              <Badge variant="info">{teacher.department || 'General'}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center gap-1">
                                {[
                                  { id: 'PRESENT', label: 'Present', color: 'bg-emerald-600 text-white' },
                                  { id: 'ABSENT', label: 'Absent', color: 'bg-red-600 text-white' },
                                  { id: 'LATE', label: 'Late', color: 'bg-amber-600 text-white' },
                                  { id: 'LEAVE', label: 'Leave', color: 'bg-slate-600 text-white' },
                                ].map(s => (
                                  <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => handleTeacherStatusChange(teacher.id, s.id)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                      cur.status === s.id ? s.color + ' shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    {s.label}
                                  </button>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="time"
                                  value={cur.checkIn || '08:00'}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setTeacherAttendance(prev => ({
                                      ...prev,
                                      [teacher.id]: { ...(prev[teacher.id] || { status: 'PRESENT' }), checkIn: val },
                                    }));
                                  }}
                                  className="p-1 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <span className="text-slate-400 text-xs">to</span>
                                <input
                                  type="time"
                                  value={cur.checkOut || '15:30'}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setTeacherAttendance(prev => ({
                                      ...prev,
                                      [teacher.id]: { ...(prev[teacher.id] || { status: 'PRESENT' }), checkOut: val },
                                    }));
                                  }}
                                  className="p-1 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                placeholder="Remarks..."
                                value={cur.remarks || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setTeacherAttendance(prev => ({
                                    ...prev,
                                    [teacher.id]: { ...(prev[teacher.id] || { status: 'PRESENT' }), remarks: val },
                                  }));
                                }}
                                className="w-full px-2 py-1 text-xs border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: ATTENDANCE CORRECTIONS */}
      {activeTab === 'corrections' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setCorrectionFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    correctionFilter === st ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            <button
              onClick={loadCorrections}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="px-4 py-3 font-bold">Request Date</th>
                      <th className="px-4 py-3 font-bold">Student</th>
                      <th className="px-4 py-3 font-bold">Attendance Date</th>
                      <th className="px-4 py-3 font-bold">Requested Change</th>
                      <th className="px-4 py-3 font-bold">Reason</th>
                      <th className="px-4 py-3 font-bold text-center">Status</th>
                      <th className="px-4 py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {correctionLoading ? (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Loading requests...</td></tr>
                    ) : corrections.filter(c => correctionFilter === 'ALL' || c.status === correctionFilter).length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No {correctionFilter !== 'ALL' ? correctionFilter.toLowerCase() : ''} correction requests found.</td></tr>
                    ) : (
                      corrections
                        .filter(c => correctionFilter === 'ALL' || c.status === correctionFilter)
                        .map(req => (
                          <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-900">
                                {req.attendance?.student?.firstName} {req.attendance?.student?.lastName}
                              </div>
                              <div className="text-xs text-slate-500">
                                {req.attendance?.classSection?.class?.name} - {req.attendance?.classSection?.section?.name}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-700">
                              {new Date(req.attendance?.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">{req.oldStatus}</span>
                                <span className="text-slate-400">→</span>
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">{req.requestedStatus}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={req.reason}>
                              {req.reason}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant={req.status === 'APPROVED' ? 'success' : req.status === 'REJECTED' ? 'danger' : 'warning'}>
                                {req.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {req.status === 'PENDING' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleApproveCorrection(req.id)}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectCorrection(req.id)}
                                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 font-medium">Processed</span>
                              )}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
