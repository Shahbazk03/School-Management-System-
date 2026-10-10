'use client';

import { useNotices, useNews } from '@/api/hooks';
import { LoadingSpinner, EmptyState, ErrorState, Badge, priorityColor } from '@/components/ui';
import { Bell, Megaphone } from 'lucide-react';
import { useState } from 'react';

export default function ParentNotices() {
  const [activeTab, setActiveTab] = useState<'NOTICES' | 'NEWS'>('NOTICES');
  
  const { data: notices, loading: nLoading, error: nError, refetch: nRefetch } = useNotices('PARENTS');
  const { data: news, loading: newsLoading, error: newsError, refetch: newsRefetch } = useNews();

  if (nLoading || newsLoading) return <LoadingSpinner label="Loading announcements..." />;
  if (nError || newsError) return <div className="p-8"><ErrorState message="Unable to load data." onRetry={nRefetch} /></div>;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">News & Notices</h1>
        <p className="text-sm text-slate-500 mt-1">Stay updated with school announcements for parents.</p>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('NOTICES')}
          className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'NOTICES' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Important Notices
        </button>
        <button
          onClick={() => setActiveTab('NEWS')}
          className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'NEWS' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          School News
        </button>
      </div>

      {activeTab === 'NOTICES' && (
        <div className="space-y-4">
          {!notices || notices.length === 0 ? (
            <EmptyState icon={Bell} title="No Notices" description="There are no important notices for you right now." />
          ) : (
            notices.map((n: any, i: number) => (
              <div key={i} className={`bg-white p-5 rounded-2xl border-l-4 shadow-sm ${priorityColor(n.priority)}`}>
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="font-bold text-slate-900 text-lg">{n.title}</h3>
                  <Badge variant={n.priority === 'HIGH' || n.priority === 'URGENT' ? 'error' : n.priority === 'MEDIUM' ? 'warning' : 'info'}>
                    {n.priority}
                  </Badge>
                </div>
                <p className="text-slate-700">{n.content}</p>
                <p className="text-xs text-slate-400 mt-3 font-medium">Published on {new Date(n.publishDate || n.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'NEWS' && (
        <div className="space-y-6">
          {!news || news.length === 0 ? (
            <EmptyState icon={Megaphone} title="No News" description="No news articles have been published." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {news.map((item: any, i: number) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
                  <div className="h-48 bg-gradient-to-br from-cyan-100 to-blue-100 relative overflow-hidden">
                    {item.image || item.imageUrl ? (
                      <img src={item.image || item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cyan-300">
                        <Megaphone size={48} />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold text-cyan-600 mb-2 uppercase tracking-wider">{new Date(item.publishDate || item.createdAt).toLocaleDateString()}</p>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-600">{item.content}</p>
                    <p className="text-xs text-slate-400 mt-4 font-medium italic">By {item.author || 'School Admin'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
