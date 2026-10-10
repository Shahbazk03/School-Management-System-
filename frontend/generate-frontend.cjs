const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src', 'app');

const entities = [
  { name: 'students', label: 'Students', icon: 'Users', fields: ['studentId', 'firstName', 'lastName', 'email', 'parentId'] },
  { name: 'parents', label: 'Parents', icon: 'Users', fields: ['parentId', 'firstName', 'lastName', 'email', 'phone'] },
  { name: 'teachers', label: 'Teachers', icon: 'BookOpen', fields: ['teacherId', 'firstName', 'lastName', 'email', 'phone'] },
  { name: 'classes', label: 'Classes', icon: 'ClipboardList', fields: ['className', 'description'] },
  { name: 'sessions', label: 'Academic Sessions', icon: 'Calendar', endpoint: 'academic-sessions', fields: ['sessionYear', 'startDate', 'endDate', 'status'] },
  { name: 'news', label: 'News', icon: 'Newspaper', fields: ['title', 'content', 'publishedDate'] },
  { name: 'notices', label: 'Notices', icon: 'Bell', fields: ['title', 'description', 'priority', 'date'] },
  { name: 'achievements', label: 'Achievements', icon: 'Award', fields: ['title', 'studentId', 'category', 'date'] },
  { name: 'feedback', label: 'Feedback', icon: 'MessageSquare', fields: ['subject', 'description', 'status', 'priority'] }
];

// Helper to ensure dir exists
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// 1. Generate Admin CRUD Pages
entities.forEach(entity => {
  const dir = path.join(baseDir, 'admin', entity.name);
  ensureDir(dir);
  
  const endpoint = entity.endpoint || entity.name;

  const code = `'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { Loader2, Plus, Trash2, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function Admin${entity.label.replace(/\s+/g, '')}() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { register, handleSubmit, reset } = useForm();
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/${endpoint}');
      setData(res.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData: any) => {
    try {
      await apiClient.post('/${endpoint}', formData);
      reset();
      fetchData();
    } catch (err) {
      alert('Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      try {
        await apiClient.delete(\`/${endpoint}/\${id}\`);
        fetchData();
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manage ${entity.label}</h1>
      
      {error && <div className="text-red-500">{error}</div>}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="font-semibold mb-4 text-gray-900">Add New ${entity.label}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${entity.fields.map(f => `
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">${f}</label>
              <input {...register('${f}')} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
            </div>`).join('')}
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">Save</button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  ${entity.fields.slice(0, 4).map(f => `<th className="p-4 font-medium text-gray-700 capitalize">${f}</th>`).join('')}
                  <th className="p-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map(row => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    ${entity.fields.slice(0, 4).map(f => `<td className="p-4 text-gray-900">{row.${f}}</td>`).join('')}
                    <td className="p-4">
                      <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}`;

  fs.writeFileSync(path.join(dir, 'page.tsx'), code);
});

// 2. Parent Views
const parentViews = [
  { name: 'timetable', label: 'Timetable', icon: 'Clock' },
  { name: 'exams', label: 'Examinations', icon: 'BookOpen' },
  { name: 'achievements', label: 'Achievements', icon: 'Award' }
];

parentViews.forEach(view => {
  const dir = path.join(baseDir, 'parent', view.name);
  ensureDir(dir);

  const code = `'use client';
import { useContext, useEffect, useState } from 'react';
import { ParentContext } from '../layout';
import { apiClient } from '@/api/client';
import { Loader2 } from 'lucide-react';

export default function Parent${view.label.replace(/\s+/g, '')}() {
  const { selectedChildId } = useContext(ParentContext);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedChildId) return;
    setLoading(true);
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/${view.name}');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedChildId]);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">${view.label}</h1>
      {data.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center text-gray-500">
          No records found.
        </div>
      ) : (
        <div className="grid gap-4">
          {data.map((item: any) => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-gray-900">
              {JSON.stringify(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}`;
  fs.writeFileSync(path.join(dir, 'page.tsx'), code);
});

console.log('Frontend scaffolding replaced with functional integrations.');
