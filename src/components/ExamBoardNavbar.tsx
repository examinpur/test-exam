'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Board, Exam, Subject } from '@/types';

interface BoardWithExams extends Board {
  exams: ExamWithSubjects[];
}

interface ExamWithSubjects extends Exam {
  subjects: Subject[];
}

export default function ExamBoardNavbar() {
  const [boardsData, setBoardsData] = useState<BoardWithExams[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBoard, setHoveredBoard] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        const [boardsRes, examsRes, subjectsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/boards`),
          fetch(`${API_BASE_URL}/api/v1/exams`),
          fetch(`${API_BASE_URL}/api/v1/subjects`),
        ]);

        const [boardsData, examsData, subjectsData] = await Promise.all([
          boardsRes.json(),
          examsRes.json(),
          subjectsRes.json(),
        ]);

        const boards = boardsData.success ? boardsData.data : [];
        const exams = examsData.success ? examsData.data : [];
        const subjects = subjectsData.success ? subjectsData.data : [];

        // Organize data: Group exams by board, and subjects by exam
        const boardsWithExams: BoardWithExams[] = boards.map((board) => {
          const boardExams = exams
            .filter((exam) => exam.boardId === board._id)
            .map((exam): ExamWithSubjects => ({
              ...exam,
              subjects: subjects.filter((subject) => subject.examId === exam._id),
            }))
            .sort((a, b) => a.order - b.order);

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
              onMouseLeave={() => setHoveredBoard(null)}
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
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50">
                  {board.exams.map((exam) => (
                    <div
                      key={exam._id}
                      className="group relative"
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
                            className="w-4 h-4 text-gray-400 group-hover:text-gray-600"
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
                      {exam.subjects.length > 0 && (
                        <div className="hidden group-hover:block absolute left-full top-0 ml-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50">
                          {exam.subjects.map((subject) => (
                            <Link
                              key={subject._id}
                              href={`/${board.slug}/${exam.slug}/${subject.slug}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                            >
                              {subject.name}
                            </Link>
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

