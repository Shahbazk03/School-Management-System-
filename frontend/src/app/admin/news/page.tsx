'use client';

import { useNews } from '@/api/hooks';
import { newsService } from '@/api/services';
import { CrudPage } from '@/components/CrudPage';
import { Badge } from '@/components/ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function AdminNews() {
  const { data, loading, refetch } = useNews();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const handleAddClick = () => {
    reset({ publishDate: new Date().toISOString().split('T')[0] });
    setEditingId(null);
    setFormOpen(true);
  };

  const handleEditClick = (row: any) => {
    reset({ ...row, publishDate: row.publishDate?.split('T')[0] || new Date().toISOString().split('T')[0] });
    setEditingId(row.id);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this news article?')) {
      try {
        await newsService.delete(id);
        toast.success('News deleted');
        refetch();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to delete');
      }
    }
  };

  const onSubmit = async (formData: any) => {
    try {
      const payload = { ...formData, publishDate: new Date(formData.publishDate).toISOString() };
      if (editingId) {
        await newsService.update(editingId, payload);
        toast.success('News updated');
      } else {
        await newsService.create(payload);
        toast.success('News published');
      }
      setFormOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    }
  };

  const columns = [
    { header: 'Image', accessor: (row: any) => (
      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
        {row.imageUrl || row.image ? <img src={row.imageUrl || row.image} className="w-full h-full object-cover" alt="thumbnail" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px]">No Img</div>}
      </div>
    )},
    { header: 'Title', accessor: (row: any) => <span className="font-bold text-slate-900">{row.title}</span> },
    { header: 'Author', accessor: (row: any) => row.author || 'School Admin' },
    { header: 'Publish Date', accessor: (row: any) => new Date(row.publishDate || row.createdAt).toLocaleDateString() },
  ];

  return (
    <CrudPage
      title="School News"
      subtitle="Publish articles and news to the public board."
      data={data}
      loading={loading}
      columns={columns}
      onAddClick={handleAddClick}
      onEditClick={handleEditClick}
      onDeleteClick={handleDelete}
      isFormOpen={formOpen}
      onCloseForm={() => setFormOpen(false)}
      searchPlaceholder="Search news by title..."
      renderForm={() => (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Article Title</label>
              <input {...register('title', { required: true })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="News Title" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Image URL</label>
              <input {...register('image')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Content</label>
              <textarea {...register('content', { required: true })} rows={6} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm resize-none" placeholder="Write article content here..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Author Name</label>
                <input {...register('author')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="e.g. Principal" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Publish Date</label>
                <input type="date" {...register('publishDate', { required: true })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm disabled:opacity-50">
              {isSubmitting ? 'Publishing...' : 'Publish Article'}
            </button>
          </div>
        </form>
      )}
    />
  );
}