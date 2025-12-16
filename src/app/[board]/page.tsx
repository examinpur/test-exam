import { Metadata } from 'next';
import Link from 'next/link';
import { getBoardBySlug, getExamsByBoardId } from '@/lib/api';
import { Board, Exam } from '@/types';
import Navbar from '@/components/Navbar';
import ExamBoardNavbarWrapper from '@/components/ExamBoardNavbarWrapper';
import Footer from '@/components/Footer';

export const revalidate = 60;

interface BoardPageProps {
  params: Promise<{
    board: string;
  }>;
}

export async function generateMetadata({ params }: BoardPageProps): Promise<Metadata> {
  try {
    const { board: boardSlug } = await params;
    const board = await getBoardBySlug(boardSlug);
    return {
      title: `${board.name} - Exam Platform`,
      description: `Browse all exams under ${board.name}`,
    };
  } catch {
    return {
      title: 'Board - Exam Platform',
    };
  }
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { board: boardSlug } = await params;
  
  let board: Board | null = null;
  let exams: Exam[] = [];
  let error: string | null = null;

  try {
    const fetchedBoard = await getBoardBySlug(boardSlug);
    board = fetchedBoard;
    if (fetchedBoard) {
      exams = await getExamsByBoardId(fetchedBoard._id).catch(() => []);
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load data';
    console.error('Error fetching data:', error);
  }

  if (!board) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <ExamBoardNavbarWrapper />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Board not found</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <ExamBoardNavbarWrapper />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{board.name}</h1>
          <p className="text-gray-600">Select an exam to start your preparation</p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading exams: {error}</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">No exams available for this board.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <Link
                key={exam._id}
                href={`/${exam.boardSlug}/${exam.slug}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-900">{exam.name}</h3>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

