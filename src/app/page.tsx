import { Metadata } from 'next';
import { getAllBoards, getAllExams } from '@/lib/api';
import Navbar from '@/components/Navbar';
import ExamBoardNavbar from '@/components/ExamBoardNavbar';
import ExamCard from '@/components/ExamCard';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Exam Platform - ABC Institute',
  description: 'Prepare for entrance exams with comprehensive question banks, chapter-wise practice, and paper-wise tests.',
};

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export default async function HomePage() {
  let boards = [];
  let exams : any = [];
  let error = null;

  try {
    // Fetch boards and exams in parallel
    [boards, exams] = await Promise.all([
      getAllBoards(),
      getAllExams(),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load data';
    console.error('Error fetching data:', error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <ExamBoardNavbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Exam Entrance Board
          </h1>
          <p className="text-gray-600">
            Select an exam to start your preparation
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              Error loading exams: {error}
            </p>
            <p className="text-sm text-red-600 mt-2">
              Please make sure the backend API is running at {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
            </p>
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              No exams available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam : any) => (
              <ExamCard key={exam._id} exam={exam} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
