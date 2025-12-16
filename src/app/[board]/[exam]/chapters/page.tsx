import { Metadata } from 'next';
import Link from 'next/link';
import { getExamBySlug, getSubjectsByExamId, getAllChapterGroups } from '@/lib/api';
import { Exam, Subject, ChapterGroup } from '@/types';
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

export default async function ChaptersPage({ params }: ChaptersPageProps) {
  let exam: Exam | null = null;
  let subjects: Subject[] = [];
  let chapterGroups: ChapterGroup[] = [];
  let error: string | null = null;

  try {
    const fetchedExam = await getExamBySlug(params.exam);
    exam = fetchedExam;
    if (fetchedExam) {
      const [subjectsData, chapterGroupsData] = await Promise.all([
        getSubjectsByExamId(fetchedExam._id).catch(() => []),
        getAllChapterGroups().catch(() => []),
      ]);
      subjects = subjectsData;
      chapterGroups = chapterGroupsData.filter((cg) => cg.examId === fetchedExam._id);
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load chapters';
    console.error('Error fetching chapters:', error);
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <ExamBoardNavbarWrapper />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Exam not found</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const examUrl = `/${exam.boardSlug}/${exam.slug}`;
  const chapterGroupsBySubject = subjects.map((subject) => ({
    subject,
    chapterGroups: chapterGroups.filter((cg) => cg.subjectId === subject._id).sort((a, b) => a.order - b.order),
  }));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <ExamBoardNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <Link href={examUrl} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to {exam.name}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chapters</h1>
          <p className="text-gray-600">{exam.name}</p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading chapters: {error}</p>
          </div>
        ) : chapterGroupsBySubject.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">No chapters available yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {chapterGroupsBySubject.map(({ subject, chapterGroups }) => (
              <div key={subject._id}>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">{subject.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chapterGroups.map((chapterGroup) => (
                    <Link
                      key={chapterGroup._id}
                      href={`${examUrl}/chapters/${chapterGroup._id}/questions`}
                      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                    >
                      <h3 className="text-lg font-medium text-gray-900">{chapterGroup.name}</h3>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

