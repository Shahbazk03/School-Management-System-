import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="h-96 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-medium animate-pulse">Loading dashboard...</p>
      </div>
    </div>
  );
}
