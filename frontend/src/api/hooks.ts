'use client';

/**
 * Central data hooks for the entire application.
 * Each hook handles loading, error, and empty states correctly.
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/auth/AuthContext';
import {
  studentService,
  parentService,
  teacherService,
  attendanceService,
  timetableService,
  examService,
  reportCardService,
  newsService,
  noticeService,
  questionPaperService,
  achievementService,
  feedbackService,
  auditLogService,
  sessionService,
  classService,
} from '@/api/services';

// ─── Shared state types ──────────────────────────────────────────────────────

export type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

// Generic fetch hook
export function useFetch<T>(fetcher: () => Promise<T>, deps: any[] = []): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current) setData(result);
    } catch (err: any) {
      if (mountedRef.current)
        setError(err?.response?.data?.message || 'Failed to load data');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ─── Session ─────────────────────────────────────────────────────────────────

export function useCurrentSession() {
  return useFetch(() => sessionService.getCurrent(), []);
}

export function useAllSessions() {
  return useFetch(async () => {
    const res = await sessionService.getAll();
    return res.data || [];
  }, []);
}

// ─── School ──────────────────────────────────────────────────────────────────

export function useSchoolSettings() {
  return useFetch(async () => {
    const { schoolService } = await import('@/api/services');
    const res = await schoolService.getSettings();
    return res.data;
  }, []);
}

// ─── Current User Entity ─────────────────────────────────────────────────────

export function useCurrentStudent() {
  const { user } = useAuth();
  return useFetch(
    async () => {
      if (!user?.id) return null;
      return studentService.getByUserId(user.id);
    },
    [user?.id]
  );
}

export function useCurrentTeacher() {
  const { user } = useAuth();
  return useFetch(
    async () => {
      if (!user?.id) return null;
      return teacherService.getByUserId(user.id);
    },
    [user?.id]
  );
}

export function useCurrentParent() {
  const { user } = useAuth();
  return useFetch(
    async () => {
      if (!user?.id) return null;
      return parentService.getByUserId(user.id);
    },
    [user?.id]
  );
}

// ─── Parent's Children ───────────────────────────────────────────────────────

export function useParentChildren(parentId: string | null) {
  return useFetch(
    async () => {
      if (!parentId) return [];
      // Fetch all students and find ones linked via parentStudents
      const res = await studentService.getAll();
      const all: any[] = res.data || [];
      // Filter students where parentStudents includes this parentId
      const linked = all.filter((s: any) =>
        s.parentStudents?.some((ps: any) => ps.parentId === parentId)
      );
      return linked;
    },
    [parentId]
  );
}

// ─── Attendance ──────────────────────────────────────────────────────────────

export type AttendanceStats = {
  total: number;
  present: number;
  absent: number;
  leave: number;
  percentage: number | null; // null = no records
  status: 'NO_DATA' | 'OK';
};

export function useStudentAttendanceStats(studentId: string | null, sessionId: string | null): FetchState<AttendanceStats> {
  return useFetch(
    async () => {
      if (!studentId || !sessionId) return { total: 0, present: 0, absent: 0, leave: 0, percentage: null, status: 'NO_DATA' as const };
      const res = await attendanceService.getCumulative(studentId, sessionId);
      const d = res.data;
      if (!d) return { total: 0, present: 0, absent: 0, leave: 0, percentage: null, status: 'NO_DATA' as const };
      const total = (d.total ?? 0);
      const present = (d.present ?? 0);
      const absent = (d.absent ?? 0);
      const leave = (d.leave ?? d.excused ?? 0);
      const percentage = total > 0 ? Math.round((present / total) * 100) : null;
      return { total, present, absent, leave, percentage, status: total > 0 ? 'OK' : 'NO_DATA' } as AttendanceStats;
    },
    [studentId, sessionId]
  );
}

export function useStudentAttendanceHistory(studentId: string | null) {
  return useFetch(
    async () => {
      if (!studentId) return [];
      // Fetch all sessions
      const sessionsRes = await sessionService.getAll();
      const sessions: any[] = sessionsRes.data || [];
      // For each session, try to get cumulative
      const results = await Promise.all(
        sessions.map(async (session) => {
          try {
            const res = await attendanceService.getCumulative(studentId, session.id);
            const d = res.data;
            if (!d) return null;
            const total = d.total ?? 0;
            const present = d.present ?? 0;
            const percentage = total > 0 ? Math.round((present / total) * 100) : null;
            return {
              sessionId: session.id,
              sessionName: session.name,
              total,
              present,
              absent: d.absent ?? 0,
              percentage,
            };
          } catch {
            return null;
          }
        })
      );
      return results.filter(Boolean);
    },
    [studentId]
  );
}

// ─── Timetable ───────────────────────────────────────────────────────────────

export function useTodayTimetable() {
  return useFetch(async () => {
    return timetableService.getToday();
  }, []);
}

export function useAllTimetable() {
  return useFetch(async () => {
    const res = await timetableService.getAll();
    return res.data || [];
  }, []);
}

// ─── Exams ───────────────────────────────────────────────────────────────────

export function useUpcomingExams() {
  return useFetch(async () => {
    return examService.getUpcoming();
  }, []);
}

export function useAllExams() {
  return useFetch(async () => {
    const res = await examService.getAll();
    return res.data || [];
  }, []);
}

// ─── Report Cards ────────────────────────────────────────────────────────────

export function useStudentReportCards(studentId: string | null) {
  return useFetch(
    async () => {
      if (!studentId) return [];
      return reportCardService.getByStudent(studentId);
    },
    [studentId]
  );
}

// ─── News ────────────────────────────────────────────────────────────────────

export function useNews(limit?: number) {
  return useFetch(async () => {
    const res = await newsService.getAll();
    const all: any[] = res.data || [];
    return limit ? all.slice(0, limit) : all;
  }, [limit]);
}

// ─── Notices ─────────────────────────────────────────────────────────────────

export function useNotices(audience?: 'STUDENTS' | 'PARENTS' | 'TEACHERS' | 'ALL', limit?: number) {
  return useFetch(
    async () => {
      const items = audience
        ? await noticeService.getForAudience(audience)
        : (await noticeService.getAll()).data || [];
      return limit ? items.slice(0, limit) : items;
    },
    [audience, limit]
  );
}

// ─── Achievements ────────────────────────────────────────────────────────────

export function useStudentAchievements(studentId: string | null) {
  return useFetch(
    async () => {
      if (!studentId) return [];
      return achievementService.getByStudent(studentId);
    },
    [studentId]
  );
}

// ─── Feedback ────────────────────────────────────────────────────────────────

export function useMyFeedback(userId: string | null) {
  return useFetch(
    async () => {
      if (!userId) return [];
      return feedbackService.getMyFeedback(userId);
    },
    [userId]
  );
}

export function useAllFeedback() {
  return useFetch(async () => {
    const res = await feedbackService.getAll();
    return res.data || [];
  }, []);
}

// ─── Question Papers ─────────────────────────────────────────────────────────

export function useQuestionPapers() {
  return useFetch(async () => {
    const res = await questionPaperService.getAll();
    return res.data || [];
  }, []);
}

// ─── Admin: Students / Teachers / Parents ────────────────────────────────────

export function useAllStudents() {
  return useFetch(async () => {
    const res = await studentService.getAll();
    return res.data || [];
  }, []);
}

export function useAllTeachers() {
  return useFetch(async () => {
    const res = await teacherService.getAll();
    return res.data || [];
  }, []);
}

export function useAllParents() {
  return useFetch(async () => {
    const res = await parentService.getAll();
    return res.data || [];
  }, []);
}

export function useAllClasses() {
  return useFetch(async () => {
    const res = await classService.getAll();
    return res.data || [];
  }, []);
}

// ─── Audit Logs ──────────────────────────────────────────────────────────────

export function useAuditLogs(limit?: number) {
  return useFetch(async () => {
    const res = await auditLogService.getAll();
    const all: any[] = res.data || [];
    return limit ? all.slice(0, limit) : all;
  }, [limit]);
}

// ─── Teacher Assignments ─────────────────────────────────────────────────────

export function useTeacherAssignments(teacherId: string | null) {
  return useFetch(
    async () => {
      if (!teacherId) return [];
      const res = await teacherService.getAssignments(teacherId);
      return res.data || [];
    },
    [teacherId]
  );
}
