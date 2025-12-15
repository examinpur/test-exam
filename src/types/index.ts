export type Board = {
  _id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Exam = {
  _id: string;
  boardId: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  boardSlug: string;
  pathSlugs: string[];
  pathKey: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Subject = {
  _id: string;
  boardId: string;
  examId: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  boardSlug: string;
  examSlug: string;
  pathSlugs: string[];
  pathKey: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ChapterGroup = {
  _id: string;
  boardId: string;
  examId: string;
  subjectId: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  boardSlug: string;
  examSlug: string;
  subjectSlug: string;
  pathSlugs: string[];
  pathKey: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Chapter = {
  _id: string;
  boardId: string;
  examId: string;
  subjectId: string;
  chapterGroupId: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  boardSlug: string;
  examSlug: string;
  subjectSlug: string;
  chapterGroupSlug: string;
  pathSlugs: string[];
  pathKey: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Paper = {
  _id: string;
  boardId: string;
  examId: string;
  name: string;
  slug: string;
  year: number;
  paperNumber: number;
  shift: string;
  isActive: boolean;
  boardSlug: string;
  examSlug: string;
  pathSlugs: string[];
  pathKey: string;
  questionPathKeys?: string[];
  questionCount: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Question = {
  _id: string;
  boardId: string;
  examId: string;
  subjectId: string;
  chapterGroupId: string;
  chapterId: string;
  topicId?: string;
  boardSlug: string;
  examSlug: string;
  subjectSlug: string;
  chapterGroupSlug: string;
  chapterSlug: string;
  topicSlug?: string;
  comprehensionId?: string;
  comprehensionOrder?: number;
  slug: string;
  pathSlugs: string[];
  pathKey: string;
  kind: 'MCQ' | 'MSQ' | 'TRUE_FALSE' | 'INTEGER' | 'FILL_BLANK' | 'COMPREHENSION_PASSAGE';
  marks: number;
  negMarks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  calculator: boolean;
  passage?: any;
  prompt?: any;
  correct?: any;
  year?: number;
  paperTitle?: string;
  paperId?: string;
  yearKey?: string;
  section?: string[];
  tags?: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: any;
};

