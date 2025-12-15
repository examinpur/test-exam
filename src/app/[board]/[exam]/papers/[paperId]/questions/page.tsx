import { Metadata } from 'next';
import Link from 'next/link';
import { getExamBySlug, getPapersByExamId, getQuestionsByPaperId, getAllPapers } from '@/lib/api';
import { Exam, Paper, Question } from '@/types';
import Navbar from '@/components/Navbar';
import ExamBoardNavbar from '@/components/ExamBoardNavbar';
import Footer from '@/components/Footer';

export const revalidate = 60;

interface PaperQuestionsPageProps {
  params: {
    board: string;
    exam: string;
    paperId: string;
  };
}

export async function generateMetadata({ params }: PaperQuestionsPageProps): Promise<Metadata> {
  try {
    const [exam, papers] = await Promise.all([
      getExamBySlug(params.exam),
      getAllPapers(),
    ]);
    const paper = papers.find((p) => p._id === params.paperId);
    return {
      title: paper ? `${paper.name} - Questions | Exam Platform` : 'Questions - Exam Platform',
    };
  } catch {
    return {
      title: 'Questions - Exam Platform',
    };
  }
}

export default async function PaperQuestionsPage({ params }: PaperQuestionsPageProps) {
  let exam: Exam | null = null;
  let paper: Paper | null = null;
  let questions: Question[] = [];
  let error: string | null = null;

  try {
    const fetchedExam = await getExamBySlug(params.exam);
    exam = fetchedExam;
    if (fetchedExam) {
      const papers = await getPapersByExamId(fetchedExam._id);
      paper = papers.find((p) => p._id === params.paperId) || null;
      if (paper) {
        // Use paper slug as paperId (which is how questions reference papers)
        questions = await getQuestionsByPaperId(paper.slug);
      }
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load questions';
    console.error('Error fetching questions:', error);
  }

  if (!exam || !paper) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <ExamBoardNavbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Paper not found</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const examUrl = `/${exam.boardSlug}/${exam.slug}`;
  const papersUrl = `${examUrl}/papers`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <ExamBoardNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <Link href={papersUrl} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Papers
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{paper.name}</h1>
          <p className="text-gray-600">{exam.name}</p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading questions: {error}</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">No questions available for this paper yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <Link
                key={question._id}
                href={`/${question.pathSlugs.join('/')}/${question.slug}`}
                className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <span className="text-lg font-semibold text-gray-500">Q{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {question.kind}
                      </span>
                      {question.difficulty && (
                        <span className={`px-2 py-1 text-xs rounded ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">{question.marks} marks</span>
                    </div>
                    {question.prompt?.en?.content && (
                      <p className="text-gray-900 line-clamp-2">
                        {question.prompt.en.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>
                    )}
                  </div>
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

