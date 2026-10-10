'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

export default function AdminExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [exRes, sessRes, schoolRes] = await Promise.all([
        apiClient.get('/exams').catch(() => ({ data: [] })),
        apiClient.get('/academic-sessions').catch(() => ({ data: [] })),
        apiClient.get('/schools/settings').catch(() => ({ data: null }))
      ]);
      setExams(exRes.data);
      setSessions(sessRes.data);
      if (schoolRes.data) setSchoolId(schoolRes.data.id);
    } catch (e) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData: any) => {
    if (!schoolId) {
      toast.error('School context missing');
      return;
    }
    
    try {
      const payload = {
        name: formData.name,
        academicSessionId: formData.academicSessionId,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };
      
      await apiClient.post('/exams', payload);
      toast.success('Exam Created');
      setShowForm(false);
      reset();
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create exam');
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Are you sure you want to delete this exam?')) return;
    try {
      await apiClient.delete(`/exams/${id}`);
      toast.success('Exam Deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete exam');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Examinations</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded font-bold shadow hover:bg-blue-700">
            + Create Exam
          </button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Exam</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-1">Exam Name</label>
                  <input {...register('name', { required: true })} className="w-full p-2 border rounded" placeholder="e.g. Mid-Term Examination 2026" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Exam Type</label>
                  <select {...register('examType', { required: true })} className="w-full p-2 border rounded">
                    <option value="REGULAR">Regular (Annual/Half-Yearly)</option>
                    <option value="UNIT_TEST">Unit Test</option>
                    <option value="PRACTICAL">Practical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Academic Session</label>
                  <select {...register('academicSessionId', { required: true })} className="w-full p-2 border rounded">
                    <option value="">Select...</option>
                    {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Start Date</label>
                  <input type="date" {...register('startDate', { required: true })} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">End Date</label>
                  <input type="date" {...register('endDate', { required: true })} className="w-full p-2 border rounded" />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 p-2 bg-gray-100 rounded font-bold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 p-2 bg-blue-600 text-white rounded font-bold disabled:opacity-50">Save Exam</button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">Exam Name</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Type</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Dates</th>
                  <th className="px-4 py-3 font-medium text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-slate-900">{exam.name}</td>
                    <td className="px-4 py-3"><Badge>{exam.examType}</Badge></td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(exam.id)} className="text-red-500 font-bold hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
                {exams.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No exams configured.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
