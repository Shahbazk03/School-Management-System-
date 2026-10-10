'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';

export default function AdminTimetablePage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    dayOfWeek: 'MONDAY',
    period: 1,
    startTime: '08:00',
    endTime: '08:45',
    subjectId: '',
    teacherId: '',
    room: '',
  });

  const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const DAY_MAP: Record<string, number> = { 'SUNDAY': 0, 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6 };

  useEffect(() => {
    Promise.all([
      apiClient.get('/academic-sessions').catch(() => ({ data: [] })),
      apiClient.get('/classes').catch(() => ({ data: [] })),
      apiClient.get('/sections').catch(() => ({ data: [] })),
      apiClient.get('/subjects').catch(() => ({ data: [] })),
      apiClient.get('/teachers').catch(() => ({ data: [] })),
    ]).then(([sess, cls, sec, sub, tea]) => {
      setSessions(sess.data);
      setClasses(cls.data);
      setSections(sec.data);
      setSubjects(sub.data);
      setTeachers(tea.data);
      const curr = sess.data.find((s: any) => s.isCurrent);
      if (curr) setSelectedSession(curr.id);
    });
  }, []);

  const loadTimetable = async () => {
    if (!selectedSession || !selectedClass || !selectedSection) return;
    setLoading(true);
    try {
      const cls = classes.find((c: any) => c.id === selectedClass);
      const cs = cls?.classSections?.find((cs: any) => cs.sectionId === selectedSection);
      const targetClassSectionId = cs?.id;

      if (!targetClassSectionId) {
        setTimetable([]);
        toast.error('This class section does not exist in the database.');
        return;
      }

      const res = await apiClient.get('/timetable');
      const filtered = res.data.filter((t: any) => 
        t.academicSessionId === selectedSession && 
        t.classSectionId === targetClassSectionId
      );
      setTimetable(filtered);
    } catch (e) {
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession || !selectedClass || !selectedSection) {
      toast.error('Please select Session, Class, and Section first');
      return;
    }
    
    try {
      const cls = classes.find((c: any) => c.id === selectedClass);
      const cs = cls?.classSections?.find((cs: any) => cs.sectionId === selectedSection);
      const targetClassSectionId = cs?.id;

      if (!targetClassSectionId) {
        toast.error('Cannot save: Class section does not exist.');
        return;
      }

      await apiClient.post('/timetable', {
        academicSessionId: selectedSession,
        classSectionId: targetClassSectionId,
        periodNumber: Number(formData.period),
        dayOfWeek: DAY_MAP[formData.dayOfWeek],
        startTime: formData.startTime,
        endTime: formData.endTime,
        subjectId: formData.subjectId,
        teacherId: formData.teacherId,
        room: formData.room,
      });
      toast.success('Timetable entry created');
      setShowForm(false);
      loadTimetable();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create entry. It might conflict.');
    }
  };
  
  const handleDelete = async (id: string) => {
    if(!confirm('Delete this period?')) return;
    try {
      await apiClient.delete(`/timetable/${id}`);
      toast.success('Period deleted');
      loadTimetable();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Timetable Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Session</label>
              <select value={selectedSession} onChange={e => setSelectedSession(e.target.value)} className="w-full p-2 border rounded">
                <option value="">Select...</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
              <button 
                onClick={loadTimetable}
                disabled={!selectedSession || !selectedClass || !selectedSection || loading}
                className="w-full p-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load Timetable'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClass && selectedSection && !loading && (
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Weekly Schedule</CardTitle>
            <button 
              onClick={() => setShowForm(!showForm)} 
              className="px-3 py-1 bg-green-100 text-green-700 rounded font-bold hover:bg-green-200"
            >
              {showForm ? 'Cancel' : '+ Add Period'}
            </button>
          </CardHeader>
          <CardContent>
            {showForm && (
              <form onSubmit={handleSaveEntry} className="mb-8 p-4 bg-gray-50 border rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold mb-1">Day</label>
                  <select required name="dayOfWeek" value={formData.dayOfWeek} onChange={e => setFormData({...formData, dayOfWeek: e.target.value})} className="w-full p-2 border rounded">
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Period Number</label>
                  <input required type="number" min="1" max="10" name="period" value={formData.period} onChange={e => setFormData({...formData, period: Number(e.target.value)})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Start Time</label>
                  <input required type="time" name="startTime" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">End Time</label>
                  <input required type="time" name="endTime" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-1">Subject</label>
                  <select required name="subjectId" value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">Select...</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.subjectName} ({s.subjectCode})</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-1">Teacher</label>
                  <select required name="teacherId" value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">Select...</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold mb-1">Room</label>
                  <input name="room" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} className="w-full p-2 border rounded" placeholder="e.g. Room 101" />
                </div>
                <div>
                  <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded font-bold">Save</button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 border bg-gray-100 font-bold w-24">Time</th>
                    {DAYS.map(day => <th key={day} className="p-3 border bg-gray-100 font-bold text-center">{day}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[1,2,3,4,5,6,7,8].map(period => (
                    <tr key={period}>
                      <td className="p-3 border font-bold text-gray-500 bg-gray-50 text-center">Period {period}</td>
                      {DAYS.map(day => {
                        const dayInt = DAY_MAP[day];
                        const entry = timetable.find(t => t.dayOfWeek === dayInt && t.periodNumber === period);
                        if (!entry) {
                          return (
                            <td 
                              key={day} 
                              className="p-3 border text-center hover:bg-blue-50 text-gray-300 cursor-pointer transition-colors"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, dayOfWeek: day, period: period }));
                                setShowForm(true);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              title={`Click to add class for ${day} Period ${period}`}
                            >
                              —
                            </td>
                          );
                        }
                        
                        const subject = subjects.find(s => s.id === entry.subjectId);
                        const teacher = teachers.find(t => t.id === entry.teacherId);
                        
                        return (
                          <td key={day} className="p-3 border text-center hover:bg-gray-50 relative group">
                            <div className="font-bold text-slate-800">{subject?.subjectName || 'Subject'}</div>
                            <div className="text-xs text-blue-600 font-medium">{teacher?.firstName} {teacher?.lastName}</div>
                            <div className="text-[10px] text-gray-500 mt-1">{entry.startTime} - {entry.endTime} {entry.room && `| ${entry.room}`}</div>
                            <button onClick={() => handleDelete(entry.id)} className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100 p-1">✕</button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
