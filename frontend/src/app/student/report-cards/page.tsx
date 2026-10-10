'use client';

import { useCurrentStudent, useStudentReportCards } from '@/api/hooks';
import { LoadingSpinner, EmptyState, ErrorState, Badge, priorityColor } from '@/components/ui';
import { FileText, Download, TrendingUp } from 'lucide-react';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';

export default function StudentReportCards() {
  const { data: student, loading: studentLoading } = useCurrentStudent();
  const { data: reportCards, loading: rcLoading, error, refetch } = useStudentReportCards(student?.id || null);

  if (studentLoading || rcLoading) return <LoadingSpinner label="Loading your results..." />;
  if (error) return <div className="p-8"><ErrorState message="Unable to load report cards." onRetry={refetch} /></div>;
  
  if (!reportCards || reportCards.length === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <EmptyState icon={FileText} title="No Report Cards" description="Your results will appear here once published." />
      </div>
    );
  }

  const handleDownload = async (rc: any) => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf' });
      // Example endpoint for PDF generation
      const res = await apiClient.post(`/report-cards/pdf`, {
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
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Academic Results</h1>
        <p className="text-sm text-slate-500 mt-1">View and download your report cards.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((rc: any, i: number) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
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
              {rc.remarks && (
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Remarks</span>
                  <p className="text-sm text-slate-700 italic">"{rc.remarks}"</p>
                </div>
              )}
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
    </div>
  );
}
