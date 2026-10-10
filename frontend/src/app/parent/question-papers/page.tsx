'use client';

import { useQuestionPapers } from '@/api/hooks';
import { LoadingSpinner, EmptyState, ErrorState, Badge } from '@/components/ui';
import { FileText, Download } from 'lucide-react';

export default function ParentQuestionPapers() {
  const { data: papers, loading, error, refetch } = useQuestionPapers();

  if (loading) return <LoadingSpinner label="Loading materials..." />;
  if (error) return <div className="p-8"><ErrorState message="Unable to load question papers." onRetry={refetch} /></div>;
  
  if (!papers || papers.length === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <EmptyState icon={FileText} title="No Question Papers" description="No previous question papers have been uploaded yet." />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Question Papers</h1>
        <p className="text-sm text-slate-500 mt-1">Access past papers and study materials for your children.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Exam & Subject</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Max Marks</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {papers.map((paper: any, i: number) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-base">{paper.exam?.name || 'Examination'}</p>
                      <p className="text-sm text-slate-500">{paper.subject?.subjectName || 'Subject'}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <Badge variant="info">Max: {paper.maxMarks}</Badge>
                </td>
                <td className="py-4 px-6 text-right">
                  <a
                    href={paper.fileUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    <Download size={16} /> Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
