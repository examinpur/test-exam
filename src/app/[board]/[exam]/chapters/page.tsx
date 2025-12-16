import { Metadata } from 'next';
import Link from 'next/link';
import { getBoardBySlug, getExamBySlug, getAllSubjects, getAllChapterGroups, getAllChapters } from '@/lib/api';
import { Board, Exam, Subject, ChapterGroup, Chapter } from '@/types';
import Navbar from '@/components/Navbar';
import ExamBoardNavbarWrapper from '@/components/ExamBoardNavbarWrapper';
import Footer from '@/components/Footer';

export const revalidate = 60;

interface ChaptersPageProps {
  params: {
    board: string;
    exam: string;
  };
}

export async function generateMetadata({ params }: ChaptersPageProps): Promise<Metadata> {
  try {
    const exam = await getExamBySlug(params.exam);
    return {
      title: `Chapters - ${exam.name} | Exam Platform`,
      description: `Browse all chapters for ${exam.name}`,
    };
  } catch {
    return {
      title: 'Chapters - Exam Platform',
    };
  }
}

interface SubjectData {
  subject: Subject;
  chapterGroups: {
    chapterGroup: ChapterGroup;
    chapters: Chapter[];
  }[];
}

export default async function ChaptersPage({ params }: ChaptersPageProps) {
  let board: Board | null = null;
  let exam: Exam | null = null;
  let subjects: Subject[] = [];
  let chapterGroups: ChapterGroup[] = [];
  let chapters: Chapter[] = [];
  let error: string | null = null;

  try {
    // Fetch board and exam using slugs
    const [fetchedBoard, fetchedExam] = await Promise.all([
      getBoardBySlug(params.board).catch(() => null),
      getExamBySlug(params.exam).catch(() => null),
    ]);

    board = fetchedBoard;
    exam = fetchedExam;

    if (fetchedBoard && fetchedExam) {
      // Fetch all subjects, chapter groups, and chapters
      const [subjectsData, chapterGroupsData, chaptersData] = await Promise.all([
        getAllSubjects().catch(() => []),
        getAllChapterGroups().catch(() => []),
        getAllChapters().catch(() => []),
      ]);

      // Filter data for this exam
      subjects = subjectsData
        .filter((s: Subject) => s.examId === fetchedExam._id)
        .sort((a: Subject, b: Subject) => (a.order || 0) - (b.order || 0));

      chapterGroups = chapterGroupsData
        .filter((cg: ChapterGroup) => cg.examId === fetchedExam._id)
        .sort((a: ChapterGroup, b: ChapterGroup) => (a.order || 0) - (b.order || 0));

      chapters = chaptersData
        .filter((ch: Chapter) => ch.examId === fetchedExam._id)
        .sort((a: Chapter, b: Chapter) => (a.order || 0) - (b.order || 0));
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load chapters';
    console.error('Error fetching chapters:', err);
  }

  // Organize data: Group chapters by subject and chapter group
  const organizedData: SubjectData[] = subjects.map((subject: Subject) => {
    const subjectChapterGroups = chapterGroups
      .filter((cg: ChapterGroup) => cg.subjectId === subject._id)
      .map((cg: ChapterGroup) => ({
        chapterGroup: cg,
        chapters: chapters
          .filter((ch: Chapter) => ch.chapterGroupId === cg._id)
          .sort((a: Chapter, b: Chapter) => (a.order || 0) - (b.order || 0)),
      }))
      .filter((item) => item.chapters.length > 0); // Only include chapter groups with chapters

    return {
      subject,
      chapterGroups: subjectChapterGroups,
    };
  }).filter((item) => item.chapterGroups.length > 0); // Only include subjects with chapter groups

  if (!board || !exam) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <ExamBoardNavbarWrapper />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{!board ? 'Board not found' : 'Exam not found'}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const examUrl = `/${board.slug}/${exam.slug}`;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />
      <ExamBoardNavbarWrapper />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8">
          <Link href={examUrl} className="text-blue-600 hover:text-blue-800 mb-4 inline-block flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {exam.name}
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Chapters
          </h1>
          <p className="text-lg text-gray-600">{exam.name}</p>
        </div>

        {error ? (
          <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-red-800 font-semibold">Error loading chapters</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : organizedData.length === 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-yellow-800 font-semibold">No Chapters Available</h3>
                <p className="text-yellow-700 mt-1">No chapters available for this exam yet.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {organizedData.map(({ subject, chapterGroups }) => (
              <div key={subject._id} className="space-y-8">
                {/* Subject Heading */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{subject.name}</h2>
                </div>

                {/* Chapter Groups and Chapters */}
                {chapterGroups.map(({ chapterGroup, chapters }) => (
                  <div key={chapterGroup._id} className="space-y-4">
                    {/* Chapter Group Sub-heading */}
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h3 className="text-xl font-semibold text-gray-800">{chapterGroup.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}
                      </p>
                    </div>

                    {/* Chapters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {chapters.map((chapter: Chapter) => (
                        <Link
                          key={chapter._id}
                          href={`/${board.slug}/${exam.slug}/${subject.slug}/${chapterGroup.slug}/${chapter.slug}`}
                          className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 p-6 border border-gray-200 hover:border-blue-300"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                                {chapter.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Order: {chapter.order || 0}
                              </p>
                            </div>
                            <svg
                              className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0"
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
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

