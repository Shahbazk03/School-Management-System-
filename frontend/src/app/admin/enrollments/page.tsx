'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';
import { 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Filter, 
  RefreshCw, 
  GraduationCap, 
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function AdminEnrollmentsPage() {
  const [activeTab, setActiveTab] = useState<'enrollments' | 'promote'>('enrollments');

  // Master Data
  const [sessions, setSessions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);

  // Enrollment Filter State
  const [filterSession, setFilterSession] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Promotion Wizard State
  const [sourceSession, setSourceSession] = useState('');
  const [sourceClass, setSourceClass] = useState('');
  const [sourceSection, setSourceSection] = useState('');

  const [targetSession, setTargetSession] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const [targetSection, setTargetSection] = useState('');

  const [eligibleStudents, setEligibleStudents] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [loadingEligible, setLoadingEligible] = useState(false);
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    Promise.all([
      apiClient.get('/academic-sessions').catch(() => ({ data: [] })),
      apiClient.get('/classes').catch(() => ({ data: [] })),
      apiClient.get('/sections').catch(() => ({ data: [] })),
    ]).then(([sessRes, clsRes, secRes]) => {
      setSessions(sessRes.data || []);
      setClasses(clsRes.data || []);
      setSections(secRes.data || []);

      const curr = (sessRes.data || []).find((s: any) => s.isCurrent);
      if (curr) {
        setFilterSession(curr.id);
        setTargetSession(curr.id);
      }
      if (sessRes.data?.length > 1) {
        setSourceSession(sessRes.data[0].id);
      } else if (sessRes.data?.length === 1) {
        setSourceSession(sessRes.data[0].id);
      }
    });
  }, []);

  // Fetch Enrollments
  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/enrollments');
      let data = res.data || [];
      if (filterSession) {
        data = data.filter((e: any) => e.academicSessionId === filterSession);
      }
      if (filterClass) {
        data = data.filter((e: any) => e.classSection?.classId === filterClass);
      }
      setEnrollments(data);
    } catch {
      toast.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'enrollments') {
      fetchEnrollments();
    }
  }, [activeTab, filterSession, filterClass]);

  // Load students for promotion
  const handleLoadSourceStudents = async () => {
    if (!sourceSession || !sourceClass || !sourceSection) {
      toast.error('Please select Source Session, Class, and Section');
      return;
    }

    setLoadingEligible(true);
    try {
      // Fetch enrollments matching source session
      const res = await apiClient.get('/enrollments');
      const allEnrollments = res.data || [];

      // Filter by session, class, and section
      const matched = allEnrollments.filter((e: any) => 
        e.academicSessionId === sourceSession &&
        e.classSection?.classId === sourceClass &&
        e.classSection?.sectionId === sourceSection &&
        e.admissionStatus === 'ENROLLED'
      );

      if (matched.length > 0) {
        const studentList = matched.map((e: any) => e.student).filter(Boolean);
        setEligibleStudents(studentList);
        setSelectedStudentIds(studentList.map((s: any) => s.id));
        toast.success(`Found ${studentList.length} students enrolled in this section`);
      } else {
        setEligibleStudents([]);
        setSelectedStudentIds([]);
        toast.error(`No students found in this class and section`);
      }
    } catch {
      toast.error('Failed to load eligible students');
    } finally {
      setLoadingEligible(false);
    }
  };

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === eligibleStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(eligibleStudents.map(s => s.id));
    }
  };

  const handlePromoteStudents = async () => {
    if (!selectedStudentIds.length) {
      toast.error('No students selected for promotion');
      return;
    }
    if (!targetSession || !targetClass || !targetSection) {
      toast.error('Please select Target Session, Target Class, and Target Section');
      return;
    }

    // Resolve target classSectionId
    const targetCls = classes.find(c => c.id === targetClass);
    const targetCs = targetCls?.classSections?.find((cs: any) => cs.sectionId === targetSection);
    const targetClassSectionId = targetCs ? targetCs.id : `${targetClass}-${targetSection}`;

    if (!confirm(`Are you sure you want to promote ${selectedStudentIds.length} students to the target class?`)) {
      return;
    }

    setPromoting(true);
    try {
      const res = await apiClient.post('/enrollments/promote', {
        studentIds: selectedStudentIds,
        targetAcademicSessionId: targetSession,
        targetClassSectionId,
      });

      toast.success(`Successfully promoted ${res.data?.promotedCount || selectedStudentIds.length} students!`);
      setActiveTab('enrollments');
      fetchEnrollments();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to execute promotion');
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Enrollments & Promotion</h1>
          <p className="text-slate-500 text-sm mt-1">Manage academic session enrollments and execute annual batch promotions.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('enrollments')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'enrollments' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={16} /> All Enrollments
          </button>
          <button
            onClick={() => setActiveTab('promote')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'promote' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap size={16} /> Promotion Wizard
          </button>
        </div>
      </div>

      {/* TAB 1: ALL ENROLLMENTS */}
      {activeTab === 'enrollments' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <Filter size={18} className="text-slate-400" />
                <div>
                  <select
                    value={filterSession}
                    onChange={e => setFilterSession(e.target.value)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Sessions</option>
                    {sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.isCurrent ? '(Current)' : ''}</option>)}
                  </select>
                </div>
                <div>
                  <select
                    value={filterClass}
                    onChange={e => setFilterClass(e.target.value)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Classes</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <button
                onClick={fetchEnrollments}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={16} />
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="px-4 py-3 font-bold">Student Name</th>
                      <th className="px-4 py-3 font-bold">Admission ID</th>
                      <th className="px-4 py-3 font-bold">Academic Session</th>
                      <th className="px-4 py-3 font-bold">Class & Section</th>
                      <th className="px-4 py-3 font-bold">Roll No</th>
                      <th className="px-4 py-3 font-bold text-center">Status</th>
                      <th className="px-4 py-3 font-bold">Enrollment Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Loading enrollment records...</td></tr>
                    ) : enrollments.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No enrollment records found.</td></tr>
                    ) : (
                      enrollments.map(record => (
                        <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900">{record.student?.firstName} {record.student?.lastName}</div>
                            <div className="text-xs text-slate-500">{record.student?.admissionNo}</div>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-600">{record.student?.permanentId}</td>
                          <td className="px-4 py-3">
                            <Badge variant="default">{record.academicSession?.name}</Badge>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {record.classSection?.class?.name || 'Class'} - {record.classSection?.section?.name || 'Section'}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-700">{record.rollNumber || '—'}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={record.admissionStatus === 'ENROLLED' ? 'success' : record.admissionStatus === 'PROMOTED' ? 'info' : 'warning'}>
                              {record.admissionStatus}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                            {new Date(record.startDate || record.createdAt).toLocaleDateString()}
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

      {/* TAB 2: PROMOTION WIZARD */}
      {activeTab === 'promote' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles size={20} /> Academic Year Promotion Engine
              </h2>
              <p className="text-blue-100 text-xs">
                Migrate an entire class cohort into the next grade for the upcoming academic session safely with history preservation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SOURCE CRITERIA */}
            <Card>
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
                  Select Source Cohort (Current Class)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Source Academic Session</label>
                  <select
                    value={sourceSession}
                    onChange={e => setSourceSession(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Source Session...</option>
                    {sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.isCurrent ? '(Current)' : ''}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Source Class</label>
                    <select
                      value={sourceClass}
                      onChange={e => setSourceClass(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Class...</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Source Section</label>
                    <select
                      value={sourceSection}
                      onChange={e => setSourceSection(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Section...</option>
                      {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSourceStudents}
                  disabled={loadingEligible}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2"
                >
                  {loadingEligible ? <RefreshCw size={16} className="animate-spin" /> : <Users size={16} />}
                  {loadingEligible ? 'Scanning students...' : 'Fetch Students in this Class'}
                </button>
              </CardContent>
            </Card>

            {/* TARGET DESTINATION */}
            <Card>
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">2</span>
                  Select Target Destination (Next Class)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Academic Session</label>
                  <select
                    value={targetSession}
                    onChange={e => setTargetSession(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Target Session...</option>
                    {sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.isCurrent ? '(Current)' : ''}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Class</label>
                    <select
                      value={targetClass}
                      onChange={e => setTargetClass(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Next Class...</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Section</label>
                    <select
                      value={targetSection}
                      onChange={e => setTargetSection(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Section...</option>
                      {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-800 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-blue-600 flex-shrink-0" />
                  <span>Existing enrollments in source session will automatically have their status updated to <strong>PROMOTED</strong>.</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* STUDENT SELECTION LIST */}
          {eligibleStudents.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Select Students to Promote</CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    Selected: <strong className="text-blue-600">{selectedStudentIds.length}</strong> of {eligibleStudents.length} students
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                  >
                    {selectedStudentIds.length === eligibleStudents.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    type="button"
                    onClick={handlePromoteStudents}
                    disabled={promoting || selectedStudentIds.length === 0}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all text-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {promoting ? <RefreshCw size={16} className="animate-spin" /> : <GraduationCap size={16} />}
                    {promoting ? 'Promoting Cohort...' : `Promote (${selectedStudentIds.length}) Students`}
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 font-bold w-12 text-center">
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.length === eligibleStudents.length && eligibleStudents.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded"
                          />
                        </th>
                        <th className="px-4 py-3 font-bold">Student Name</th>
                        <th className="px-4 py-3 font-bold">Admission Number</th>
                        <th className="px-4 py-3 font-bold">Permanent ID</th>
                        <th className="px-4 py-3 font-bold">Gender</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {eligibleStudents.map(student => {
                        const isChecked = selectedStudentIds.includes(student.id);
                        return (
                          <tr
                            key={student.id}
                            onClick={() => toggleStudentSelection(student.id)}
                            className={`cursor-pointer transition-colors ${
                              isChecked ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleStudentSelection(student.id)}
                                className="rounded"
                              />
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-900">
                              {student.firstName} {student.lastName}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-600">{student.admissionNo}</td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{student.permanentId}</td>
                            <td className="px-4 py-3">
                              <Badge variant="default">{student.gender}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
