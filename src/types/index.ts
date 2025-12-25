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

export type ExamSchedule = {
  date: string;
  startTime: string;
  endTime: string;
  timezone?: string;
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
  examSchedule?: ExamSchedule;
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

export type QuestionResponse = {
  questionId: string;
  chosenIdentifiers?: string[];
  freeTextAnswer?: string;
  marksAwarded?: number;
  isCorrect?: boolean;
  timeSpent?: number;
  order: number;
  flagged?: boolean;
  meta?: any;
};

export type ExamTest = {
  _id: string;
  testId: string;
  title: string;
  examKey?: string;
  syllabus?: string;
  totalQuestions?: number;
  marks?: number;
  maxNegMarks?: number;
  timeAllotted?: number;
  layout?: string;
  allowRandomize?: boolean;
  questionPool?: string[];
  languages?: string[];
  isPremium?: boolean;
  maxAttempt?: number;
  percentileId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ExamSession = {
  _id: string;
  userId: string;
  testId: string;
  seriesId?: string;
  questionOrder?: string[];
  randomSeed?: string;
  responses?: QuestionResponse[];
  correctCount?: number;
  wrongCount?: number;
  skippedCount?: number;
  totalMarks?: number;
  negativeMarks?: number;
  accuracy?: number;
  timeSpent?: number;
  subjectStats?: any;
  startedAt?: string;
  lastSeenAt?: string;
  submittedAt?: string;
  status?: 'in_progress' | 'submitted' | 'evaluated' | 'cancelled';
  attemptNumber?: number;
  ip?: string;
  device?: string;
  platform?: string;
  isAnalysisVisible?: boolean;
  evaluationSnapshot?: any;
  createdAt?: string;
  updatedAt?: string;
};

