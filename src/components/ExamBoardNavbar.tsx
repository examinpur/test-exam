'use client';

import { useState } from 'react';
import Link from 'next/link';

interface BoardWithExams {
  _id: string;
  name: string;
  slug: string;
  order: number;
  exams: ExamWithSubjects[];
}

interface ExamWithSubjects {
  _id: string;
  name: string;
  slug: string;
  order: number;
  boardId: string;
  boardSlug: string;
  subjects: SubjectWithChapterGroups[];
}

interface SubjectWithChapterGroups {
  _id: string;
  name: string;
  slug: string;
  order: number;
  examId: string;
  chapterGroups: ChapterGroupWithChapters[];
}

interface ChapterGroupWithChapters {
  _id: string;
  name: string;
  slug: string;
  order: number;
  subjectId: string;
  subjectSlug: string;
  examSlug: string;
  chapters: Chapter[];
}

interface Chapter {
  _id: string;
  name: string;
  slug: string;
  order: number;
  chapterGroupId: string;
}

interface ExamBoardNavbarProps {
  boardsData: BoardWithExams[];
}

type FixedMenuStyle = { top: number; left?: number; right?: number };

function computeFixedMenuStyle(
  anchorRect: DOMRect,
  menuWidth: number,
  menuMaxHeight = 500,
  gap = 6
): FixedMenuStyle {
  const spaceRight = window.innerWidth - anchorRect.right;
  const openRight = spaceRight >= menuWidth + gap;

  const maxTop = Math.max(8, window.innerHeight - menuMaxHeight - 8);
  const top = Math.max(8, Math.min(anchorRect.top, maxTop));

  if (openRight) {
    return { top, left: anchorRect.right + gap };
  }
  return { top, right: window.innerWidth - anchorRect.left + gap };
}

export default function ExamBoardNavbar({ boardsData }: ExamBoardNavbarProps) {
  const [hoveredBoard, setHoveredBoard] = useState<string | null>(null);
  const [hoveredExam, setHoveredExam] = useState<string | null>(null);
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);
  const [subjectsMenu, setSubjectsMenu] = useState<{ examId: string; style: FixedMenuStyle } | null>(null);
  const [chapterGroupsMenu, setChapterGroupsMenu] = useState<{ subjectId: string; style: FixedMenuStyle } | null>(null);

  const resetAll = () => {
    setHoveredBoard(null);
    setHoveredExam(null);
    setHoveredSubject(null);
    setSubjectsMenu(null);
    setChapterGroupsMenu(null);
  };

  return (
    <nav className="w-full bg-gray-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-12 flex items-center gap-6">
          {boardsData.map((board) => (
            <div
              key={board._id}
              className="relative"
              onMouseEnter={() => setHoveredBoard(board._id)}
              onMouseLeave={resetAll}
            >
              <button className="flex itemss items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                {board.name}
                <svg
                  className={`w-4 h-4 transition-transform ${hoveredBoard === board._id ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Exams Dropdown Menu */}
              {hoveredBoard === board._id && board.exams.length > 0 && (
                <div
  className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50
             max-h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar"
                  onMouseLeave={() => {
                    setHoveredExam(null);
                    setHoveredSubject(null);
                    setSubjectsMenu(null);
                    setChapterGroupsMenu(null);
                  }}
                >
                  {board.exams.map((exam) => (
                    <div
                      key={exam._id}
                      className="relative"
                      onMouseEnter={(e) => {
                        setHoveredExam(exam._id);
                        setHoveredSubject(null);
                        setChapterGroupsMenu(null);

                        if (exam.subjects.length > 0) {
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          setSubjectsMenu({
                            examId: exam._id,
                            style: computeFixedMenuStyle(rect, 256 /* w-64 */),
                          });
                        } else {
                          setSubjectsMenu(null);
                        }
                      }}
                    >
                      <div className="px-4 py-3 hover:bg-blue-50 flex items-center justify-between border-b border-gray-100 last:border-b-0 transition-colors">
                        <Link
                          href={`/${board.slug}/${exam.slug}`}
                          className="flex-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {exam.name}
                        </Link>
                        {exam.subjects.length > 0 && (
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              hoveredExam === exam._id ? 'rotate-90 text-blue-600' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                      {hoveredExam === exam._id && exam.subjects.length > 0 && subjectsMenu?.examId === exam._id && (
                        <div
  className="fixed w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[60]
             overflow-y-auto no-scrollbar"
  style={{ ...subjectsMenu.style, maxHeight: 'calc(100vh - 16px)' }}
                          onMouseLeave={() => {
                            setHoveredSubject(null);
                            setChapterGroupsMenu(null);
                          }}
                        >
                          {exam.subjects.map((subject) => (
                            <div
                              key={subject._id}
                              className="relative"
                              onMouseEnter={(e) => {
                                setHoveredExam(exam._id);
                                setHoveredSubject(subject._id);

                                if (subject.chapterGroups.length > 0) {
                                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                  setChapterGroupsMenu({
                                    subjectId: subject._id,
                                    style: computeFixedMenuStyle(rect, 288 /* w-72 */),
                                  });
                                } else {
                                  setChapterGroupsMenu(null);
                                }
                              }}
                            >
                              <div className="px-4 py-2.5 hover:bg-blue-50 flex items-center justify-between border-b border-gray-100 last:border-b-0 transition-colors">
                                <Link
                                  href={`/${board.slug}/${exam.slug}/${subject.slug}`}
                                  className="flex-1 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                                >
                                  {subject.name}
                                </Link>
                                {subject.chapterGroups.length > 0 && (
                                  <svg
                                    className={`w-4 h-4 text-gray-400 transition-transform ${
                                      hoveredSubject === subject._id ? 'rotate-90 text-blue-600' : ''
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                )}
                              </div>
                              {hoveredSubject === subject._id &&
                                subject.chapterGroups.length > 0 &&
                                chapterGroupsMenu?.subjectId === subject._id && (
                                  <div
  className="fixed w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[70]
             overflow-y-auto no-scrollbar"
  style={{ ...chapterGroupsMenu.style, maxHeight: 'calc(100vh - 16px)' }}
>

                                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Chapter Groups
                                      </p>
                                    </div>

                                    {subject.chapterGroups.map((chapterGroup) => (
                                      <Link
                                        key={chapterGroup._id}
                                        href={`/${board.slug}/${exam.slug}/${subject.slug}/${chapterGroup.slug}`}
                                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-medium">{chapterGroup.name}</span>
                                          {chapterGroup.chapters.length > 0 && (
                                            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded-full">
                                              {chapterGroup.chapters.length}
                                            </span>
                                          )}
                                        </div>
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
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
