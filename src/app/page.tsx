import { Metadata } from 'next';
import { getAllBoards, getAllExams } from '@/lib/api';
import Navbar from '@/components/Navbar';
import ExamBoardNavbarWrapper from '@/components/ExamBoardNavbarWrapper';
import ExamCard from '@/components/ExamCard';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Exam Platform - ABC Institute',
  description: 'Prepare for entrance exams with comprehensive question banks, chapter-wise practice, and paper-wise tests.',
};

export const revalidate = 60;

export default async function HomePage() {
  let boards = [];
  let exams : any = [];
  let error = null;

  try {
    [boards, exams] = await Promise.all([
      getAllBoards(),
      getAllExams(),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load data';
    console.error('Error fetching data:', error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />
      <ExamBoardNavbarWrapper />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Exam Entrance Platform
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Prepare for your entrance exams with comprehensive question banks, chapter-wise practice, and paper-wise tests
          </p>
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
                <h3 className="text-red-800 font-semibold">Error loading exams</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <p className="text-sm text-red-600 mt-2">
                  Please make sure the backend API is running at {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
                </p>
              </div>
            </div>
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-yellow-800 font-semibold">No Exams Available</h3>
                <p className="text-yellow-700 mt-1">No exams available at the moment. Please check back later.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Available Exams
              </h2>
              <p className="text-gray-600">
                Choose an exam from the navigation bar above or select one below
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam : any) => (
                <ExamCard key={exam._id} exam={exam} />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
