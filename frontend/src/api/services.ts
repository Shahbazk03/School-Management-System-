/**
 * Centralized API service layer
 * All API calls go through these typed service functions
 */
import { apiClient } from './client';

// ─── Auth ───────────────────────────────────────────────────────────────────

export const authService = {
  login: (loginId: string, password: string) =>
    apiClient.post('/auth/login', { loginId, password }),
};

// ─── School ──────────────────────────────────────────────────────────────────

export const schoolService = {
  getSettings: () => apiClient.get('/school/settings').catch(() => ({ data: null })),
};

// ─── Academic Sessions ───────────────────────────────────────────────────────

export const sessionService = {
  getAll: () => apiClient.get('/academic-sessions'),
  getCurrent: async () => {
    const res = await apiClient.get('/academic-sessions');
    const sessions: any[] = res.data || [];
    return sessions.find((s) => s.isCurrent) || sessions[sessions.length - 1] || null;
  },
};

// ─── Students ────────────────────────────────────────────────────────────────

export const studentService = {
  getAll: () => apiClient.get('/students'),
  getById: (id: string) => apiClient.get(`/students/${id}`),
  getByUserId: async (userId: string) => {
    const res = await apiClient.get('/students');
    return (res.data || []).find((s: any) => s.userId === userId) || null;
  },
  getEnrollments: (studentId: string) =>
    apiClient.get(`/enrollments?studentId=${studentId}`).catch(() => ({ data: [] })),
  create: (data: any) => apiClient.post('/students', data),
  update: (id: string, data: any) => apiClient.patch(`/students/${id}`, data),
  delete: (id: string) => apiClient.delete(`/students/${id}`),
};

// ─── Parents ─────────────────────────────────────────────────────────────────

export const parentService = {
  getAll: () => apiClient.get('/parents'),
  getByUserId: async (userId: string) => {
    const res = await apiClient.get('/parents');
    return (res.data || []).find((p: any) => p.userId === userId) || null;
  },
  getChildrenOf: async (parentId: string) => {
    // Backend links via parent-student relationship
    const studentsRes = await apiClient.get('/students');
    const all: any[] = studentsRes.data || [];
    // Try filtering by parentStudents relation
    return all.filter((s: any) =>
      s.parentStudents?.some((ps: any) => ps.parentId === parentId)
    );
  },
};

// ─── Teachers ────────────────────────────────────────────────────────────────

export const teacherService = {
  getAll: () => apiClient.get('/teachers'),
  getByUserId: async (userId: string) => {
    const res = await apiClient.get('/teachers');
    return (res.data || []).find((t: any) => t.userId === userId) || null;
  },
  getAssignments: (teacherId: string) =>
    apiClient.get(`/teacher-assignment?teacherId=${teacherId}`).catch(() => ({ data: [] })),
  create: (data: any) => apiClient.post('/teachers', data),
  update: (id: string, data: any) => apiClient.patch(`/teachers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/teachers/${id}`),
};

// ─── Attendance ──────────────────────────────────────────────────────────────

export const attendanceService = {
  getAll: () => apiClient.get('/attendance'),
  getByStudent: (studentId: string) =>
    apiClient.get('/attendance').then((r) => ({
      data: (r.data || []).filter((a: any) => a.studentId === studentId),
    })),
  getCumulative: (studentId: string, sessionId: string) =>
    apiClient
      .get(`/attendance/student/${studentId}/cumulative?academicSessionId=${sessionId}`)
      .catch(() => ({ data: null })),
  markAttendance: (data: any) => apiClient.post('/attendance', data),
  updateAttendance: (id: string, data: any) => apiClient.patch(`/attendance/${id}`, data),
};

// ─── Teacher Attendance ──────────────────────────────────────────────────────

export const teacherAttendanceService = {
  getAll: () => apiClient.get('/teacher-attendance').catch(() => ({ data: [] })),
  mark: (data: any) => apiClient.post('/teacher-attendance', data),
};

// ─── Timetable ───────────────────────────────────────────────────────────────

export const timetableService = {
  getAll: () => apiClient.get('/timetable').catch(() => ({ data: [] })),
  getToday: async () => {
    const res = await apiClient.get('/timetable').catch(() => ({ data: [] }));
    const today = new Date().getDay(); // 0 = Sunday
    return (res.data || [])
      .filter((t: any) => t.dayOfWeek === today)
      .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
  },
  create: (data: any) => apiClient.post('/timetable', data),
  update: (id: string, data: any) => apiClient.patch(`/timetable/${id}`, data),
  delete: (id: string) => apiClient.delete(`/timetable/${id}`),
};

// ─── Exams ───────────────────────────────────────────────────────────────────

export const examService = {
  getAll: () => apiClient.get('/exams').catch(() => ({ data: [] })),
  getUpcoming: async () => {
    const res = await apiClient.get('/exams').catch(() => ({ data: [] }));
    const now = new Date();
    return (res.data || [])
      .filter((e: any) => new Date(e.startDate) >= now)
      .sort(
        (a: any, b: any) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
  },
  create: (data: any) => apiClient.post('/exams', data),
  update: (id: string, data: any) => apiClient.patch(`/exams/${id}`, data),
  delete: (id: string) => apiClient.delete(`/exams/${id}`),
};

// ─── Marks ───────────────────────────────────────────────────────────────────

export const marksService = {
  getByStudentAndExam: (studentId: string, examId: string) =>
    apiClient
      .get(`/marks/student/${studentId}/exam/${examId}`)
      .catch(() => ({ data: [] })),
  save: (data: any) => apiClient.post('/marks', data),
};

// ─── Report Cards ────────────────────────────────────────────────────────────

export const reportCardService = {
  getAll: () => apiClient.get('/report-cards').catch(() => ({ data: [] })),
  getByStudent: async (studentId: string) => {
    const res = await apiClient.get('/report-cards').catch(() => ({ data: [] }));
    return (res.data || []).filter((rc: any) => rc.studentId === studentId);
  },
  create: (data: any) => apiClient.post('/report-cards', data),
  getById: (id: string) => apiClient.get(`/report-cards/${id}`),
};

// ─── News ────────────────────────────────────────────────────────────────────

export const newsService = {
  getAll: () => apiClient.get('/news').catch(() => ({ data: [] })),
  getById: (id: string) => apiClient.get(`/news/${id}`),
  create: (data: any) => apiClient.post('/news', data),
  update: (id: string, data: any) => apiClient.patch(`/news/${id}`, data),
  delete: (id: string) => apiClient.delete(`/news/${id}`),
};

// ─── Notices ─────────────────────────────────────────────────────────────────

export const noticeService = {
  getAll: () => apiClient.get('/notices').catch(() => ({ data: [] })),
  getForAudience: async (audience: 'STUDENTS' | 'PARENTS' | 'TEACHERS' | 'ALL') => {
    const res = await apiClient.get('/notices').catch(() => ({ data: [] }));
    return (res.data || []).filter(
      (n: any) => n.targetAudience === 'ALL' || n.targetAudience === audience
    );
  },
  getById: (id: string) => apiClient.get(`/notices/${id}`),
  create: (data: any) => apiClient.post('/notices', data),
  update: (id: string, data: any) => apiClient.patch(`/notices/${id}`, data),
  delete: (id: string) => apiClient.delete(`/notices/${id}`),
};

// ─── Question Papers ─────────────────────────────────────────────────────────

export const questionPaperService = {
  getAll: () => apiClient.get('/question-papers').catch(() => ({ data: [] })),
  getById: (id: string) => apiClient.get(`/question-papers/${id}`),
  create: (data: any) => apiClient.post('/question-papers', data),
  delete: (id: string) => apiClient.delete(`/question-papers/${id}`),
};

// ─── Achievements ────────────────────────────────────────────────────────────

export const achievementService = {
  getAll: () => apiClient.get('/achievements').catch(() => ({ data: [] })),
  getByStudent: async (studentId: string) => {
    const res = await apiClient.get('/achievements').catch(() => ({ data: [] }));
    return (res.data || []).filter((a: any) => a.studentId === studentId);
  },
  create: (data: any) => apiClient.post('/achievements', data),
  delete: (id: string) => apiClient.delete(`/achievements/${id}`),
};

// ─── Feedback ────────────────────────────────────────────────────────────────

export const feedbackService = {
  getAll: () => apiClient.get('/feedback').catch(() => ({ data: [] })),
  getMyFeedback: async (userId: string) => {
    const res = await apiClient.get('/feedback').catch(() => ({ data: [] }));
    return (res.data || []).filter((f: any) => f.submittedById === userId);
  },
  submit: (data: any) => apiClient.post('/feedback', data),
  update: (id: string, data: any) => apiClient.patch(`/feedback/${id}`, data),
  delete: (id: string) => apiClient.delete(`/feedback/${id}`),
};

// ─── Audit Logs ──────────────────────────────────────────────────────────────

export const auditLogService = {
  getAll: () => apiClient.get('/audit-logs').catch(() => ({ data: [] })),
};

// ─── Classes ─────────────────────────────────────────────────────────────────

export const classService = {
  getAll: () => apiClient.get('/classes').catch(() => ({ data: [] })),
  getSections: () => apiClient.get('/sections').catch(() => ({ data: [] })),
  getClassSections: () => apiClient.get('/class-sections').catch(() => ({ data: [] })),
};
