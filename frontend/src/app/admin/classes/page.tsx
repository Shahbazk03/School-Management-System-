'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Building2, Plus, Trash2, Edit2, Check, Layers, RefreshCw } from 'lucide-react';

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Manage Sections Modal State
  const [activeClassForSections, setActiveClassForSections] = useState<any | null>(null);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clsRes, secRes] = await Promise.all([
        apiClient.get('/classes').catch(() => ({ data: [] })),
        apiClient.get('/sections').catch(() => ({ data: [] })),
      ]);
      setClasses(clsRes.data || []);
      setSections(secRes.data || []);
    } catch {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    reset({ name: '', order: classes.length + 1 });
    setEditingId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (c: any) => {
    reset({ name: c.name, order: c.order || 0 });
    setEditingId(c.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class? This may affect timetable and enrollments.')) return;
    try {
      await apiClient.delete(`/classes/${id}`);
      toast.success('Class deleted');
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete class');
    }
  };

  const onSubmit = async (formData: any) => {
    try {
      const payload = {
        name: formData.name,
        order: Number(formData.order) || 0,
      };

      if (editingId) {
        await apiClient.patch(`/classes/${editingId}`, payload);
        toast.success('Class updated');
      } else {
        await apiClient.post('/classes', payload);
        toast.success('Class created');
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save class');
    }
  };

  const toggleSectionForClass = async (classId: string, sectionId: string, isAssigned: boolean) => {
    try {
      if (isAssigned) {
        await apiClient.delete(`/classes/${classId}/sections/${sectionId}`);
        toast.success('Section removed from class');
      } else {
        await apiClient.post(`/classes/${classId}/sections`, { sectionId });
        toast.success('Section assigned to class');
      }
      
      // Update local state
      const updatedClasses = await apiClient.get('/classes');
      setClasses(updatedClasses.data || []);
      
      if (activeClassForSections && activeClassForSections.id === classId) {
        const found = (updatedClasses.data || []).find((c: any) => c.id === classId);
        if (found) setActiveClassForSections(found);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update section assignment');
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Class Architecture</h1>
          <p className="text-slate-500 text-sm mt-1">Configure academic classes, grades, and assign active sections.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Add Class
        </button>
      </div>

      {/* Class List Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-bold w-16">Order</th>
                  <th className="px-4 py-3 font-bold">Class Name</th>
                  <th className="px-4 py-3 font-bold">Assigned Sections</th>
                  <th className="px-4 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Loading classes...</td></tr>
                ) : classes.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No classes configured yet.</td></tr>
                ) : (
                  classes.map(cls => {
                    const assignedSections = cls.classSections?.map((cs: any) => cs.section) || [];
                    return (
                      <tr key={cls.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{cls.order ?? '—'}</td>
                        <td className="px-4 py-3">
                          <div className="font-extrabold text-slate-900 text-base">{cls.name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {assignedSections.length > 0 ? (
                              assignedSections.map((s: any) => (
                                <span
                                  key={s.id}
                                  className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"
                                >
                                  Section {s.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 text-xs italic">No sections assigned</span>
                            )}
                            <button
                              onClick={() => setActiveClassForSections(cls)}
                              className="ml-2 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-1"
                            >
                              <Layers size={12} /> Assign Sections
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(cls)}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Class"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(cls.id)}
                              className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Class"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
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

      {/* CREATE / EDIT CLASS MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-2xl">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Class' : 'Create New Class'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Class / Grade Name</label>
                  <input
                    {...register('name', { required: true })}
                    placeholder="e.g. Grade 1, Class 10, Nursery"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    {...register('order')}
                    placeholder="e.g. 1, 2, 3..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Class'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ASSIGN SECTIONS MODAL */}
      {activeClassForSections && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="text-blue-600" size={20} />
                Manage Sections for {activeClassForSections.name}
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Toggle sections to bind them to this class. Students and timetable entries can only be placed into assigned sections.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                {sections.map(sec => {
                  const isAssigned = (activeClassForSections.classSections || []).some((cs: any) => cs.sectionId === sec.id);
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => toggleSectionForClass(activeClassForSections.id, sec.id, isAssigned)}
                      className={`p-3 rounded-xl border text-sm font-bold flex items-center justify-between transition-all ${
                        isAssigned
                          ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span>Section {sec.name}</span>
                      {isAssigned && <Check size={16} className="text-blue-600 font-black" />}
                    </button>
                  );
                })}
              </div>

              {sections.length === 0 && (
                <p className="text-center text-xs text-slate-500 py-4">
                  No sections created yet. Create sections under the Sections module first.
                </p>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveClassForSections(null)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
                >
                  Done
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}