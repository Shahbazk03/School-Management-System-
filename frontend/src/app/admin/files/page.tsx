'use client';

import { useQuestionPapers } from '@/api/hooks';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';

export default function AdminFiles() {
  const { data, loading, refetch } = useQuestionPapers();
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    academicSessionId: '',
    classLevel: '',
    examType: 'REGULAR',
    fileUrl: '', // In real app, this would be a file upload to S3/Cloudinary. We simulate URL here.
  });

  useEffect(() => {
    Promise.all([
      apiClient.get('/subjects').catch(() => ({ data: [] })),
      apiClient.get('/academic-sessions').catch(() => ({ data: [] })),
      apiClient.get('/classes').catch(() => ({ data: [] })),
    ]).then(([sub, sess, cls]) => {
      setSubjects(sub.data);
      setSessions(sess.data);
      setClasses(cls.data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      await apiClient.post('/question-papers', formData);
      toast.success('Document uploaded successfully');
      setShowForm(false);
      refetch();
    } catch (err) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await apiClient.delete(`/question-papers/${id}`);
      toast.success('Document deleted');
      refetch();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Document Center</h1>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded font-medium shadow hover:bg-blue-700"
          >
            + Upload Document
          </button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Question Paper / Document</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-1">Document Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded" placeholder="e.g. 2026 Mathematics Mid-Term" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Subject</label>
                  <select required value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">Select...</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Academic Session</label>
                  <select required value={formData.academicSessionId} onChange={e => setFormData({...formData, academicSessionId: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">Select...</option>
                    {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Class Level</label>
                  <select required value={formData.classLevel} onChange={e => setFormData({...formData, classLevel: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">Select...</option>
                    {classes.map(c => <option key={c.level} value={c.level}>{c.name} ({c.level})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Exam Type</label>
                  <select required value={formData.examType} onChange={e => setFormData({...formData, examType: e.target.value})} className="w-full p-2 border rounded">
                    <option value="REGULAR">Regular</option>
                    <option value="UNIT_TEST">Unit Test</option>
                    <option value="PRACTICAL">Practical</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-1">File URL (Simulated Upload)</label>
                  <input required type="url" value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} className="w-full p-2 border rounded" placeholder="https://storage.example.com/file.pdf" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
                <button type="submit" disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded font-bold disabled:opacity-50">
                  {uploading ? 'Uploading...' : 'Save Document'}
                </button>
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
                  <th className="px-4 py-3 font-medium text-gray-700">Document Title</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Class/Subject</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Type</th>
                  <th className="px-4 py-3 font-medium text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Loading documents...</td></tr>
                ) : data?.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No documents found.</td></tr>
                ) : (
                  data?.map((doc: any) => (
                    <tr key={doc.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {doc.title}
                        <div className="text-[10px] text-gray-400 font-normal mt-0.5">{new Date(doc.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-900">{doc.subject?.subjectName || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">Level: {doc.classLevel || 'ALL'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge>{doc.examType}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline mr-4">View</a>
                        <button onClick={() => handleDelete(doc.id)} className="text-red-500 font-bold hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
