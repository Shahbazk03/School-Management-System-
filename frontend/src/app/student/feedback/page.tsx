'use client';

import { useMyFeedback } from '@/api/hooks';
import { feedbackService } from '@/api/services';
import { useAuth } from '@/auth/AuthContext';
import { LoadingSpinner, EmptyState, ErrorState, Badge } from '@/components/ui';
import { MessageSquare, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function StudentFeedback() {
  const { user } = useAuth();
  const { data: feedback, loading, error, refetch } = useMyFeedback(user?.id || null);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  if (loading) return <LoadingSpinner label="Loading feedback tickets..." />;
  if (error) return <div className="p-8"><ErrorState message="Unable to load tickets." onRetry={refetch} /></div>;

  const onSubmit = async (data: any) => {
    try {
      await feedbackService.submit(data);
      toast.success('Ticket submitted successfully');
      reset();
      setShowForm(false);
      refetch();
    } catch (err) {
      toast.error('Failed to submit ticket');
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Feedback & Support</h1>
          <p className="text-sm text-slate-500 mt-1">Submit feedback or request help from the administration.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> New Ticket
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-md shadow-blue-100/50 animate-in slide-in-from-top-4">
          <h2 className="font-bold text-lg mb-4 text-slate-900">Submit New Ticket</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Subject</label>
                <input {...register('subject', { required: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Brief subject" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                <select {...register('category', { required: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="ACADEMICS">Academics</option>
                  <option value="FACILITIES">Facilities</option>
                  <option value="GENERAL">General</option>
                  <option value="COMPLAINT">Complaint</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Message</label>
              <textarea {...register('message', { required: true })} rows={4} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Explain your issue in detail..." />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      {(!feedback || feedback.length === 0) ? (
        <EmptyState icon={MessageSquare} title="No tickets" description="You haven't submitted any feedback yet." />
      ) : (
        <div className="space-y-4">
          {feedback.map((item: any, i: number) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant={item.status === 'RESOLVED' ? 'success' : 'warning'}>{item.status}</Badge>
                  <span className="text-xs font-bold text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                  <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded uppercase">{item.category}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{item.subject}</h3>
                <p className="text-sm text-slate-600 mt-1">{item.message}</p>
                
                {item.resolution && (
                  <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Resolution</p>
                    <p className="text-sm text-emerald-900">{item.resolution}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
