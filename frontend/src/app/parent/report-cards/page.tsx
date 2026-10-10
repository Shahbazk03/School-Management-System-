'use client';

import { useCurrentParent, useParentChildren, useStudentReportCards } from '@/api/hooks';
import { LoadingSpinner, EmptyState, ErrorState, Badge } from '@/components/ui';
import { FileText, Download, User, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';

function StudentReportCardsView({ studentId }: { studentId: string }) {
  const { data: reportCards, loading, error, refetch } = useStudentReportCards(studentId);

  if (loading) return <LoadingSpinner label="Loading results..." />;
  if (error) return <div className="p-8"><ErrorState message="Unable to load results." onRetry={refetch} /></div>;
  if (!reportCards || reportCards.length === 0) return <EmptyState icon={FileText} title="No Report Cards" description="Results will appear here once published." />;

  const handleDownload = async (rc: any) => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf' });
      const res = await apiClient.post(`/pdf/report-card`, {
        studentId: rc.studentId,
        examId: rc.examId,
        reportCardId: rc.id
      }, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${rc.exam?.name}_ReportCard.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success('Downloaded!', { id: 'pdf' });
    } catch (e) {
      toast.error('Failed to generate PDF', { id: 'pdf' });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
      {reportCards.map((rc: any, i: number) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className={`p-6 ${rc.result === 'PASS' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
            <Badge variant="default" className="bg-white/20 text-white border-none backdrop-blur-sm mb-4">
              {rc.exam?.name || 'Examination'}
            </Badge>
            <div className="flex items-end gap-3 text-white">
              <span className="text-5xl font-black">{rc.percentage}%</span>
              <span className="text-xl font-bold opacity-90 pb-1">{rc.grade}</span>
            </div>
          </div>
          <div className="p-6 flex-1 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-500 uppercase">Total Marks</span>
              <span className="font-bold text-slate-900">{rc.totalMarks}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-500 uppercase">Status</span>
              <span className={`font-bold ${rc.result === 'PASS' ? 'text-emerald-600' : 'text-red-600'}`}>{rc.result}</span>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <button
              onClick={() => handleDownload(rc)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download size={18} /> Download PDF
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ParentReportCards() {
  const { data: parent, loading: pLoad } = useCurrentParent();
  const { data: children, loading: cLoad } = useParentChildren(parent?.id || null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) setSelectedChildId(children[0].id);
  }, [children, selectedChildId]);

  if (pLoad || cLoad) return <LoadingSpinner label="Loading..." />;
  if (!children || children.length === 0) return <EmptyState icon={User} title="No Children" />;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Academic Results</h1>
          <p className="text-sm text-slate-500">View and download report cards.</p>
        </div>
        <div className="relative w-full md:w-64">
          <select
            className="w-full appearance-none bg-blue-50 border-2 border-blue-200 text-blue-900 text-sm rounded-xl p-3 pr-10 font-bold outline-none focus:ring-4 focus:ring-blue-100 cursor-pointer"
            value={selectedChildId || ''}
            onChange={(e) => setSelectedChildId(e.target.value)}
          >
            {children.map((c: any) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-500">
            <ChevronDown size={18} strokeWidth={3} />
          </div>
        </div>
      </div>
      {selectedChildId && <StudentReportCardsView studentId={selectedChildId} />}
    </div>
  );
}
