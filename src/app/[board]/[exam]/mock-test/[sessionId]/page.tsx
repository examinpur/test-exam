'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getExamSession, updateExamSession, submitExamSession, getQuestionsByPaperId } from '@/lib/api';
import { ExamSession, Question } from '@/types';
import MockTestClient from '@/components/MockTestClient';
import Navbar from '@/components/Navbar';
import ExamBoardNavbarWrapper from '@/components/ExamBoardNavbarWrapper';
import Footer from '@/components/Footer';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function MockTestSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { board, exam, sessionId } = params;

  const [session, setSession] = useState<ExamSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>(undefined);
  const [userId] = useState('user-123'); // TODO: Get from auth context

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const sessionResult = await getExamSession(sessionId as string, userId);
        
        if (!sessionResult.success || !sessionResult.data) {
          setError('Session not found');
          setLoading(false);
          return;
        }

        const sessionData = sessionResult.data;
        setSession(sessionData);

        // Fetch questions
        if (sessionData.questionOrder && sessionData.questionOrder.length > 0) {
          // Fetch questions by their IDs
          // Note: This fetches one by one - in production, consider adding a bulk endpoint
          const questionPromises = sessionData.questionOrder.map(async (qId: string) => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/v1/questions/${qId}`);
              if (!response.ok) return null;
              const result = await response.json();
              return result.success ? result.data : null;
            } catch {
              return null;
            }
          });

          const fetchedQuestions = (await Promise.all(questionPromises)).filter((q) => q !== null);
          // Maintain the order from questionOrder
          const orderedQuestions = sessionData.questionOrder
            .map((qId: string) => fetchedQuestions.find((q: Question) => q._id === qId))
            .filter((q: Question | undefined) => q !== undefined) as Question[];
          setQuestions(orderedQuestions);
        }

        // Calculate time remaining if timeAllotted is set
        // This would require fetching the test config
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session');
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId, userId]);

  const handleResponseChange = async (questionId: string, response: Partial<any>) => {
    if (!session) return;

    const existingResponses = session.responses || [];
    const existingIndex = existingResponses.findIndex((r) => String(r.questionId) === questionId);

    let updatedResponses;
    if (existingIndex >= 0) {
      updatedResponses = [...existingResponses];
      updatedResponses[existingIndex] = { ...updatedResponses[existingIndex], ...response };
    } else {
      updatedResponses = [...existingResponses, response as any];
    }

    const updatedSession = { ...session, responses: updatedResponses };
    setSession(updatedSession);

    // Auto-save to backend
    try {
      await updateExamSession(session._id, {
        userId,
        responses: updatedResponses,
        lastSeenAt: new Date(),
      });
    } catch (err) {
      console.error('Failed to save response:', err);
    }
  };

  const handleSubmit = async () => {
    if (!session) return;

    if (!confirm('Are you sure you want to submit the test? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await submitExamSession(session._id, userId);
      if (result.success) {
        router.push(`/${board}/${exam}/mock-test/results/${session._id}`);
      } else {
        setError(result.message || 'Failed to submit test');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit test');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <ExamBoardNavbarWrapper />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <ExamBoardNavbarWrapper />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error || 'Session not found'}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (session.status !== 'in_progress') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <ExamBoardNavbarWrapper />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">This test has already been submitted.</p>
            <button
              onClick={() => router.push(`/${board}/${exam}/mock-test/results/${session._id}`)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Results
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MockTestClient
        questions={questions}
        session={session}
        onResponseChange={handleResponseChange}
        onSubmit={handleSubmit}
        timeRemaining={timeRemaining}
      />
    </div>
  );
}

