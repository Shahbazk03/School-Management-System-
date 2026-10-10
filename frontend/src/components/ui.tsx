/**
 * Shared UI primitives used across all portals
 */

import { Loader2, RefreshCw, AlertTriangle, Inbox } from 'lucide-react';

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

// ─── Loading Spinner ─────────────────────────────────────────────────────────

export function LoadingSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Loader2 className="animate-spin text-blue-500" size={36} />
      <p className="text-slate-500 text-sm font-medium animate-pulse">{label}</p>
    </div>
  );
}

// ─── Error State ─────────────────────────────────────────────────────────────

export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
        <AlertTriangle className="text-red-500" size={26} />
      </div>
      <div>
        <p className="font-semibold text-slate-800 mb-1">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 flex items-center gap-2 mx-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors"
          >
            <RefreshCw size={14} /> Try Again
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No data',
  description,
}: {
  icon?: any;
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
        <Icon className="text-slate-400" size={26} />
      </div>
      <div>
        <p className="font-semibold text-slate-700">{title}</p>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

export function SectionCard({
  title,
  action,
  children,
  className = '',
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          {title && <h2 className="font-bold text-slate-900 text-base">{title}</h2>}
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────

const BADGE_VARIANTS: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-700',
  error: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700',
  default: 'bg-slate-100 text-slate-700',
};

export function Badge({
  children,
  variant = 'default',
  className = '',
}: {
  children: React.ReactNode;
  variant?: keyof typeof BADGE_VARIANTS | string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${BADGE_VARIANTS[variant] || BADGE_VARIANTS.default} ${className}`}
    >
      {children}
    </span>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  icon: Icon,
  color = 'bg-blue-50 text-blue-600',
  sub,
}: {
  label: string;
  value: React.ReactNode;
  icon: any;
  color?: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col hover:-translate-y-0.5 transition-transform">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={22} />
      </div>
      <p className="text-2xl font-black text-slate-900 mb-0.5">{value}</p>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Priority color helper ────────────────────────────────────────────────────

export function priorityColor(priority: string) {
  switch (priority?.toUpperCase()) {
    case 'HIGH':
    case 'URGENT':
      return 'border-red-400 bg-red-50';
    case 'MEDIUM':
      return 'border-amber-400 bg-amber-50';
    default:
      return 'border-blue-300 bg-blue-50';
  }
}

export function priorityBadgeVariant(priority: string): 'error' | 'warning' | 'info' {
  switch (priority?.toUpperCase()) {
    case 'HIGH':
    case 'URGENT':
      return 'error';
    case 'MEDIUM':
      return 'warning';
    default:
      return 'info';
  }
}

// ─── Attendance Badge ─────────────────────────────────────────────────────────

export function AttendanceBadge({ percentage }: { percentage: number | null }) {
  if (percentage === null) return <Badge variant="default">No Data</Badge>;
  if (percentage >= 90) return <Badge variant="success">Excellent</Badge>;
  if (percentage >= 75) return <Badge variant="info">Good</Badge>;
  if (percentage >= 60) return <Badge variant="warning">At Risk</Badge>;
  return <Badge variant="error">Critical</Badge>;
}

// ─── Days countdown ──────────────────────────────────────────────────────────

export function daysFromNow(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Time greeting ───────────────────────────────────────────────────────────

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`px-6 py-4 border-b border-slate-100 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <h3 className={`font-bold text-lg text-slate-900 ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

