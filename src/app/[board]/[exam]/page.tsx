import { Metadata } from 'next';
import Link from 'next/link';
import { getExamBySlug } from '@/lib/api';
import { Exam } from '@/types';
import Navbar from '@/components/Navbar';
import ExamBoardNavbarWrapper from '@/components/ExamBoardNavbarWrapper';
import Footer from '@/components/Footer';

export const revalidate = 60;

interface ExamPageProps {
  params: {
    board: string;
    exam: string;
  };
}

export async function generateMetadata({ params }: ExamPageProps): Promise<Metadata> {
  try {
    const exam = await getExamBySlug(params.exam);
    return {
      title: `${exam.name} - Exam Platform`,
      description: `Practice ${exam.name} with chapter-wise and paper-wise questions`,
    };
  } catch {
    return {
      title: 'Exam - Exam Platform',
    };
  }
}

export default async function ExamPage({ params }: ExamPageProps) {
  let exam: Exam | null = null;
  let error: string | null = null;

  try {
    exam = await getExamBySlug(params.exam);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load exam';
    console.error('Error fetching exam:', error);
  }

  if (!exam || error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <ExamBoardNavbarWrapper />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error || 'Exam not found'}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const examUrl = `/${exam.boardSlug}/${exam.slug}`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <ExamBoardNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{exam.name}</h1>
          <p className="text-gray-600">Choose your practice mode</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <Link
            href={`${examUrl}/chapters`}
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chapter Wise</h3>
            <p className="text-gray-600 text-sm">Practice questions by chapters</p>
          </Link>

          <Link
            href={`${examUrl}/papers`}
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Paper Wise</h3>
            <p className="text-gray-600 text-sm">Solve previous year papers</p>
          </Link>

          <Link
            href={`${examUrl}/mock-test`}
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Mock Test</h3>
            <p className="text-gray-600 text-sm">Take a full-length mock test</p>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

