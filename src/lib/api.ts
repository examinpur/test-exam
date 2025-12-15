import { ApiResponse, Board, Exam, Subject, ChapterGroup, Chapter, Paper, Question } from '@/types';

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

