import { ApiResponse, Board, Exam, Subject, ChapterGroup, Chapter, Paper, Question, ExamTest, ExamSession } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchAPI<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data: ApiResponse<T> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'API request failed');
    }

    return data.data as T;
  } catch (error) {
    console.error(`API fetch error for ${endpoint}:`, error);
    throw error;
  }
}

export interface BulkQuestionUploadFaultyItem {
  reason: string;
  question_id: string;
}

export interface BulkQuestionUploadData {
  total: number;
  created: number;
  failed: number;
  faultyCount: number;
  faulty: BulkQuestionUploadFaultyItem[];
}

export interface BulkQuestionUploadResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: BulkQuestionUploadData;
}

export async function uploadQuestionsBulk(file: File): Promise<BulkQuestionUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/questions/bulk`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload error: ${response.status} ${response.statusText}`);
    }

    const data: BulkQuestionUploadResponse = await response.json();
    console.log('Bulk questions upload success:', data);
    return data;
  } catch (error) {
    console.error('Bulk questions upload failed:', error);
    throw error;
  }
}

export async function getAllBoards(): Promise<Board[]> {
  return fetchAPI<Board[]>('/api/v1/boards');
}

export async function getBoardBySlug(slug: string): Promise<Board> {
  return fetchAPI<Board>(`/api/v1/boards?slug=${slug}`);
}

export async function getAllExams(): Promise<Exam[]> {
  return fetchAPI<Exam[]>('/api/v1/exams');
}

export async function getExamsByBoardId(boardId: string): Promise<Exam[]> {
  return fetchAPI<Exam[]>(`/api/v1/exams?boardId=${boardId}`);
}

export async function getExamBySlug(slug: string): Promise<Exam> {
  return fetchAPI<Exam>(`/api/v1/exams?slug=${slug}`);
}

export async function getAllSubjects(): Promise<Subject[]> {
  return fetchAPI<Subject[]>('/api/v1/subjects');
}

export async function getSubjectsByExamId(examId: string): Promise<Subject[]> {
  return fetchAPI<Subject[]>(`/api/v1/subjects?examId=${examId}`);
}

export async function getSubjectBySlug(slug: string): Promise<Subject> {
  return fetchAPI<Subject>(`/api/v1/subjects?slug=${slug}`);
}

export async function getAllChapterGroups(): Promise<ChapterGroup[]> {
  return fetchAPI<ChapterGroup[]>('/api/v1/chapter-groups');
}

export async function getChapterGroupBySlug(slug: string): Promise<ChapterGroup> {
  return fetchAPI<ChapterGroup>(`/api/v1/chapter-groups?slug=${slug}`);
}

export async function getChapterGroupsBySubjectId(subjectId: string): Promise<ChapterGroup[]> {
  return fetchAPI<ChapterGroup[]>(`/api/v1/chapter-groups?subjectId=${subjectId}`);
}

export async function getAllChapters(): Promise<Chapter[]> {
  return fetchAPI<Chapter[]>('/api/v1/chapters');
}

export async function getChapterBySlug(slug: string): Promise<Chapter> {
  return fetchAPI<Chapter>(`/api/v1/chapters?slug=${slug}`);
}

export async function getChaptersByChapterGroupId(chapterGroupId: string): Promise<Chapter[]> {
  return fetchAPI<Chapter[]>(`/api/v1/chapters?chapterGroupId=${chapterGroupId}`);
}

export async function getChaptersByExamId(examId: string): Promise<Chapter[]> {
  return fetchAPI<Chapter[]>(`/api/v1/chapters?examId=${examId}`);
}

export async function getAllPapers(): Promise<Paper[]> {
  return fetchAPI<Paper[]>('/api/v1/papers');
}

export async function getPaperBySlug(slug: string): Promise<Paper> {
  return fetchAPI<Paper>(`/api/v1/papers?slug=${slug}`);
}

export async function getPapersByExamId(examId: string): Promise<Paper[]> {
  return fetchAPI<Paper[]>(`/api/v1/papers?examId=${examId}`);
}

export async function getAllQuestions(): Promise<Question[]> {
  return fetchAPI<Question[]>('/api/v1/questions');
}

export async function getQuestionByPathKey(pathKey: string): Promise<Question> {
  return fetchAPI<Question>(`/api/v1/questions?pathKey=${pathKey}`);
}

export async function getQuestionsByChapterId(chapterId: string): Promise<Question[]> {
  return fetchAPI<Question[]>(`/api/v1/questions?chapterId=${chapterId}`);
}

export async function getQuestionsByPaperId(paperId: string): Promise<Question[]> {
  return fetchAPI<Question[]>(`/api/v1/questions?paperId=${paperId}`);
}

// Exam Session API functions
export async function createExamTest(data: any): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/exam-sessions/tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API fetch error for createExamTest:', error);
    throw error;
  }
}

export async function getExamTest(testId: string): Promise<ExamTest> {
  return fetchAPI<ExamTest>(`/api/v1/exam-sessions/tests/${testId}`);
}

export async function createExamSession(data: any): Promise<ApiResponse<ExamSession>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/exam-sessions/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse<ExamSession> = await response.json();
    return result;
  } catch (error) {
    console.error('API fetch error for createExamSession:', error);
    throw error;
  }
}

export async function getExamSession(sessionId: string, userId?: string): Promise<ApiResponse<ExamSession>> {
  try {
    const url = userId
      ? `${API_BASE_URL}/api/v1/exam-sessions/sessions/${sessionId}?userId=${userId}`
      : `${API_BASE_URL}/api/v1/exam-sessions/sessions/${sessionId}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API fetch error for getExamSession:', error);
    throw error;
  }
}

export async function getUserExamSessions(userId: string, status?: string): Promise<ApiResponse<ExamSession[]>> {
  try {
    const url = status
      ? `${API_BASE_URL}/api/v1/exam-sessions/sessions/user/${userId}?status=${status}`
      : `${API_BASE_URL}/api/v1/exam-sessions/sessions/user/${userId}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API fetch error for getUserExamSessions:', error);
    throw error;
  }
}

export async function updateExamSession(sessionId: string, data: any): Promise<ApiResponse<ExamSession>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/exam-sessions/sessions/${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API fetch error for updateExamSession:', error);
    throw error;
  }
}

export async function submitExamSession(sessionId: string, userId: string): Promise<ApiResponse<ExamSession>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/exam-sessions/sessions/${sessionId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API fetch error for submitExamSession:', error);
    throw error;
  }
}

