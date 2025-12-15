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

export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: any;
};

