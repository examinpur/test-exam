import { Metadata } from "next";
import Link from "next/link";
import {
  getBoardBySlug,
  getExamBySlug,
  getSubjectBySlug,
  getChapterGroupBySlug,
  getChapterBySlug,
  getQuestionsByChapterId,
  getChapterGroupsBySubjectId,
  getAllChapters,
} from "@/lib/api";
import { Board, Exam, Subject, ChapterGroup, Chapter, Question } from "@/types";
import Navbar from "@/components/Navbar";
import ExamBoardNavbarWrapper from "@/components/ExamBoardNavbarWrapper";
import Footer from "@/components/Footer";
import ChapterHeaderAndQuestionsClient from "@/components/ChapterHeaderAndQuestionsClient";

export const revalidate = 60;

interface ChapterPageProps {
  params: Promise<{
    board: string;
    exam: string;
    subject: string;
    chapterGroup: string;
    chapter: string;
  }>;
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { chapter: chapterSlug } = await params;
  const chapter = await getChapterBySlug(chapterSlug).catch(() => null);

  if (!chapter) return { title: "Chapter - Exam Platform" };

  return {
    title: `${chapter.name} - Practice Questions`,
    description: `Practice questions for ${chapter.name}`,
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const {
    board: boardSlug,
    exam: examSlug,
    subject: subjectSlug,
    chapterGroup: chapterGroupSlug,
    chapter: chapterSlug,
  } = await params;

  let board: Board | null = null;
  let exam: Exam | null = null;
  let subject: Subject | null = null;
  let chapterGroup: ChapterGroup | null = null;
  let chapter: Chapter | null = null;
  let chapterGroups: ChapterGroup[] = [];
  let allChapters: Chapter[] = [];
  let questions: Question[] = [];
  let error: string | null = null;

  try {
    const fetchedChapter = await getChapterBySlug(chapterSlug).catch(() => null);
    if (!fetchedChapter) throw new Error("Chapter not found");
    chapter = fetchedChapter;

    const [
      fetchedBoard,
      fetchedExam,
      fetchedSubject,
      fetchedChapterGroup,
      chapterGroupsData,
      allChaptersData,
      questionsData,
    ] = await Promise.all([
      getBoardBySlug(boardSlug).catch(() => null),
      getExamBySlug(examSlug).catch(() => null),
      getSubjectBySlug(subjectSlug).catch(() => null),
      getChapterGroupBySlug(chapterGroupSlug).catch(() => null),
      getChapterGroupsBySubjectId(fetchedChapter.subjectId).catch(() => []),
      getAllChapters().catch(() => []),
      getQuestionsByChapterId(chapter._id).catch(() => []), // Hardcoded for testing
    ]);

    board = fetchedBoard;
    exam = fetchedExam;
    subject = fetchedSubject;
    chapterGroup = fetchedChapterGroup;

    chapterGroups = chapterGroupsData
      .filter((cg: ChapterGroup) => cg.isActive)
      .sort((a: ChapterGroup, b: ChapterGroup) => (a.order || 0) - (b.order || 0));

    allChapters = allChaptersData
      .filter((c: Chapter) => c.isActive && c.subjectId === fetchedChapter.subjectId)
      .sort((a: Chapter, b: Chapter) => (a.order || 0) - (b.order || 0));

    questions = questionsData.filter((q: Question) => q.isActive);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load data";
    console.error("Error fetching data:", err);
  }

  if (!board || !exam || !subject || !chapterGroup || !chapter) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <ExamBoardNavbarWrapper />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Content not found</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

return (
  <div className="h-dvh flex flex-col bg-gray-50 overflow-hidden">
    <Navbar />
    <ExamBoardNavbarWrapper />

    <main className="flex-1 w-full overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 bg-white border-r border-gray-200 h-full overflow-y-auto">
          <div className="p-4">
            {chapterGroups.map((cg) => {
              const groupChapters = allChapters.filter((ch) => ch.chapterGroupId === cg._id);
              if (groupChapters.length === 0) return null;

              return (
                <div key={cg._id} className="mb-6">
                  <h2 className="text-sm font-bold text-gray-900 mb-2 px-3">{cg.name}</h2>
                  <div className="space-y-1">
                    {groupChapters.map((ch) => (
                      <Link
                        key={ch._id}
                        href={`/${board.slug}/${exam.slug}/${subject.slug}/${cg.slug}/${ch.slug}`}
                        className={`block px-3 py-2 rounded text-sm transition-colors ${
                          ch._id === chapter._id
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {ch.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-white">
            {error ? (
              <div className="p-6">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            ) : questions.length === 0 ? (
              <div className="p-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <p className="text-yellow-800">No questions available for this chapter yet.</p>
                </div>
              </div>
            ) : (
              <ChapterHeaderAndQuestionsClient
                questions={questions}
                subject={{ name: subject.name, slug: subject.slug }}
                chapterGroup={{ name: chapterGroup.name, slug: chapterGroup.slug }}
                chapter={{ name: chapter.name, slug: chapter.slug }}
                hrefs={{
                  board: `/${board.slug}/${exam.slug}`,
                  subject: `/${board.slug}/${exam.slug}/${subject.slug}`,
                  chapterGroup: `/${board.slug}/${exam.slug}/${subject.slug}/${chapterGroup.slug}`,
                  chapter: `/${board.slug}/${exam.slug}/${subject.slug}/${chapterGroup.slug}/${chapter.slug}`,
                }}
                exam={{ name: exam.name }}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  </div>
);

}
