'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Board, Exam, Subject, ChapterGroup, Chapter } from '@/types';

interface BoardWithExams extends Board {
  exams: ExamWithSubjects[];
}

interface ExamWithSubjects extends Exam {
  subjects: SubjectWithChapterGroups[];
}

interface SubjectWithChapterGroups extends Subject {
  chapterGroups: ChapterGroupWithChapters[];
}

interface ChapterGroupWithChapters extends ChapterGroup {
  chapters: Chapter[];
}

export default function ExamBoardNavbar() {
  const [boardsData, setBoardsData] = useState<BoardWithExams[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBoard, setHoveredBoard] = useState<string | null>(null);
  const [hoveredExam, setHoveredExam] = useState<string | null>(null);
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        const [boardsRes, examsRes, subjectsRes, chapterGroupsRes, chaptersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/boards`),
          fetch(`${API_BASE_URL}/api/v1/exams`),
          fetch(`${API_BASE_URL}/api/v1/subjects`),
          fetch(`${API_BASE_URL}/api/v1/chapter-groups`),
          fetch(`${API_BASE_URL}/api/v1/chapters`),
        ]);

        const [boardsData, examsData, subjectsData, chapterGroupsData, chaptersData] = await Promise.all([
          boardsRes.json(),
          examsRes.json(),
          subjectsRes.json(),
          chapterGroupsRes.json(),
          chaptersRes.json(),
        ]);

        const boards = boardsData.success ? boardsData.data : [];
        const exams = examsData.success ? examsData.data : [];
        const subjects = subjectsData.success ? subjectsData.data : [];
        const chapterGroups = chapterGroupsData.success ? chapterGroupsData.data : [];
        const chapters = chaptersData.success ? chaptersData.data : [];

        // Organize data: Group exams by board, subjects by exam, chapterGroups by subject, chapters by chapterGroup
        const boardsWithExams: BoardWithExams[] = boards.map((board: Board) => {
          const boardExams = exams
            .filter((exam: Exam) => exam.boardId === board._id)
            .map((exam: Exam): ExamWithSubjects => {
              const examSubjects = subjects
                .filter((subject: Subject) => subject.examId === exam._id)
                .map((subject: Subject): SubjectWithChapterGroups => {
                  const subjectChapterGroups = chapterGroups
                    .filter((cg: ChapterGroup) => cg.subjectId === subject._id)
                    .map((cg: ChapterGroup): ChapterGroupWithChapters => ({
                      ...cg,
                      chapters: chapters
                        .filter((ch: Chapter) => ch.chapterGroupId === cg._id)
                        .sort((a: Chapter, b: Chapter) => a.order - b.order),
                    }))
                    .sort((a: ChapterGroupWithChapters, b: ChapterGroupWithChapters) => a.order - b.order);

                  return {
                    ...subject,
                    chapterGroups: subjectChapterGroups,
                  };
                })
                .sort((a: SubjectWithChapterGroups, b: SubjectWithChapterGroups) => a.order - b.order);

              return {
                ...exam,
                subjects: examSubjects,
              };
            })
            .sort((a: ExamWithSubjects, b: ExamWithSubjects) => a.order - b.order);

          return {
            ...board,
            exams: boardExams,
          };
        });

        // Sort boards by order
        boardsWithExams.sort((a, b) => a.order - b.order);

        setBoardsData(boardsWithExams);
      } catch (error) {
        console.error('Error fetching navigation data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <nav className="w-full bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-12 flex items-center">
            <p className="text-sm text-gray-500">Loading navigation...</p>
          </div>
        </div>
      </nav>
    );
  }

  if (boardsData.length === 0) {
    return null;
  }

  return (
    <nav className="w-full bg-gray-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-12 flex items-center gap-6">
          {boardsData.map((board) => (
            <div
              key={board._id}
              className="relative"
              onMouseEnter={() => setHoveredBoard(board._id)}
              onMouseLeave={() => {
                setHoveredBoard(null);
                setHoveredExam(null);
                setHoveredSubject(null);
              }}
            >
              <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                {board.name}
                <svg
                  className={`w-4 h-4 transition-transform ${
                    hoveredBoard === board._id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {hoveredBoard === board._id && board.exams.length > 0 && (
                <div
                  className="absolute top-full left-0 mt-1 w-72 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto"
                  onMouseEnter={() => {}}
                  onMouseLeave={() => {
                    setHoveredExam(null);
                    setHoveredSubject(null);
                  }}
                >
                  {board.exams.map((exam) => (
                    <div
                      key={exam._id}
                      className="relative"
                      onMouseEnter={() => setHoveredExam(exam._id)}
                      onMouseLeave={() => {
                        if (hoveredSubject === null) {
                          setHoveredExam(null);
                        }
                      }}
                    >
                      <div className="px-4 py-2 hover:bg-gray-50 flex items-center justify-between">
                        <Link
                          href={`/${board.slug}/${exam.slug}`}
                          className="flex-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {exam.name}
                        </Link>
                        {exam.subjects.length > 0 && (
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              hoveredExam === exam._id ? 'rotate-90 text-gray-600' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Subjects Submenu */}
                      {hoveredExam === exam._id && exam.subjects.length > 0 && (
                        <div
                          className="absolute top-0 left-full ml-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto"
                          onMouseEnter={() => setHoveredExam(exam._id)}
                          onMouseLeave={() => {
                            setHoveredExam(null);
                            setHoveredSubject(null);
                          }}
                        >
                          {exam.subjects.map((subject) => (
                            <div
                              key={subject._id}
                              className="relative"
                              onMouseEnter={() => {
                                setHoveredExam(exam._id);
                                setHoveredSubject(subject._id);
                              }}
                              onMouseLeave={() => {
                                setHoveredSubject(null);
                              }}
                            >
                              <div className="px-4 py-2 hover:bg-gray-50 flex items-center justify-between">
                                <Link
                                  href={`/${board.slug}/${exam.slug}/${subject.slug}`}
                                  className="flex-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                                >
                                  {subject.name}
                                </Link>
                                {subject.chapterGroups.length > 0 && (
                                  <svg
                                    className={`w-4 h-4 text-gray-400 transition-transform ${
                                      hoveredSubject === subject._id ? 'rotate-90 text-gray-600' : ''
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                )}
                              </div>

                              {/* ChapterGroups Submenu */}
                              {hoveredSubject === subject._id && subject.chapterGroups.length > 0 && (
                                <div
                                  className="absolute top-0 left-full ml-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto"
                                  onMouseEnter={() => {
                                    setHoveredExam(exam._id);
                                    setHoveredSubject(subject._id);
                                  }}
                                  onMouseLeave={() => {
                                    setHoveredSubject(null);
                                  }}
                                >
                                  {subject.chapterGroups.map((chapterGroup) => (
                                    <div key={chapterGroup._id}>
                                      <Link
                                        href={`/${board.slug}/${exam.slug}/${subject.slug}/${chapterGroup.slug}`}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                      >
                                        {chapterGroup.name}
                                        {chapterGroup.chapters.length > 0 && (
                                          <span className="ml-2 text-xs text-gray-400">
                                            ({chapterGroup.chapters.length})
                                          </span>
                                        )}
                                      </Link>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}

