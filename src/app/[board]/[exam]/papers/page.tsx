import { Metadata } from 'next';
import Link from 'next/link';
import { getExamBySlug, getPapersByExamId } from '@/lib/api';
import { Exam, Paper } from '@/types';
import Navbar from '@/components/Navbar';
import ExamBoardNavbar from '@/components/ExamBoardNavbar';
import Footer from '@/components/Footer';

export const revalidate = 60;

interface PapersPageProps {
  params: {
    board: string;
    exam: string;
  };
}

export async function generateMetadata({ params }: PapersPageProps): Promise<Metadata> {
  try {
    const exam = await getExamBySlug(params.exam);
    return {
      title: `Papers - ${exam.name} | Exam Platform`,
      description: `Browse all previous year papers for ${exam.name}`,
    };
  } catch {
    return {
      title: 'Papers - Exam Platform',
    };
  }
}

export default async function PapersPage({ params }: PapersPageProps) {
  let exam: Exam | null = null;
  let papers: Paper[] = [];
  let error: string | null = null;

  try {
    const fetchedExam = await getExamBySlug(params.exam);
    exam = fetchedExam;
    if (fetchedExam) {
      papers = await getPapersByExamId(fetchedExam._id);
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load papers';
    console.error('Error fetching papers:', error);
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <ExamBoardNavbar />
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <ExamBoardNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <Link href={examUrl} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to {exam.name}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Previous Year Papers</h1>
          <p className="text-gray-600">{exam.name}</p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading papers: {error}</p>
          </div>
        ) : papers.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">No papers available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper) => (
              <Link
                key={paper._id}
                href={`${examUrl}/papers/${paper._id}/questions`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{paper.name}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Year: {paper.year}</p>
                  {paper.paperNumber > 1 && <p>Paper {paper.paperNumber}</p>}
                  {paper.shift && <p>Shift: {paper.shift}</p>}
                  {paper.questionCount > 0 && <p className="text-blue-600">{paper.questionCount} questions</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

