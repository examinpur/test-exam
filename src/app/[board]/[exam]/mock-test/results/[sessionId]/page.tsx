'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getExamSession } from '@/lib/api';
import { ExamSession, Question } from '@/types';
import Navbar from '@/components/Navbar';
import ExamBoardNavbarWrapper from '@/components/ExamBoardNavbarWrapper';
import Footer from '@/components/Footer';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function MockTestResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { board, exam, sessionId } = params;

  const [session, setSession] = useState<ExamSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

        if (sessionData.status !== 'evaluated') {
          setError('Test results are not available yet');
          setLoading(false);
          return;
        }

        // Fetch questions
        if (sessionData.questionOrder && sessionData.questionOrder.length > 0) {
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
          const orderedQuestions = sessionData.questionOrder
            .map((qId: string) => fetchedQuestions.find((q: Question) => q._id === qId))
            .filter((q: Question | undefined) => q !== undefined) as Question[];
          setQuestions(orderedQuestions);
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results');
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId, userId]);

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

  const responsesMap = new Map();
  if (session.responses) {
    session.responses.forEach((resp) => {
      responsesMap.set(String(resp.questionId), resp);
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <ExamBoardNavbarWrapper />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6">
          <Link
            href={`/${board}/${exam}/mock-test`}
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Mock Tests
          </Link>
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Test Results</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-700 font-medium mb-1">Total Marks</div>
              <div className="text-2xl font-bold text-green-900">{session.totalMarks || 0}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-700 font-medium mb-1">Correct</div>
              <div className="text-2xl font-bold text-blue-900">{session.correctCount || 0}</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-700 font-medium mb-1">Wrong</div>
              <div className="text-2xl font-bold text-red-900">{session.wrongCount || 0}</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-sm text-yellow-700 font-medium mb-1">Accuracy</div>
              <div className="text-2xl font-bold text-yellow-900">
                {session.accuracy?.toFixed(1) || 0}%
              </div>
            </div>
          </div>

          {session.submittedAt && (
            <div className="text-sm text-gray-600">
              Submitted on: {new Date(session.submittedAt).toLocaleString()}
            </div>
          )}
        </div>

        {/* Questions Review */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Question Review</h2>
          <div className="space-y-6">
            {questions.map((question, index) => {
              const response = responsesMap.get(question._id);
              const isCorrect = response?.isCorrect || false;
              const p = question.prompt?.en ?? question.prompt?.hi;
              const options = p?.options ?? [];

              return (
                <div
                  key={question._id}
                  className={`border-2 rounded-lg p-4 ${
                    isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                        isCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">
                          {question.kind}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            isCorrect
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                        <span className="text-xs text-gray-600">
                          Marks: {response?.marksAwarded || 0} / {question.marks}
                        </span>
                      </div>

                      <div
                        className="text-gray-900 mb-4"
                        dangerouslySetInnerHTML={{
                          __html: p?.content || 'Question content not available',
                        }}
                      />

                      {options.length > 0 && (
                        <div className="space-y-2">
                          {options.map((option: any) => {
                            const isSelected = response?.chosenIdentifiers?.includes(option.identifier);
                            const isCorrectOption = question.correct?.identifiers?.includes(option.identifier);

                            return (
                              <div
                                key={option.identifier}
                                className={`p-3 rounded border ${
                                  isCorrectOption
                                    ? 'bg-green-100 border-green-300'
                                    : isSelected
                                    ? 'bg-red-100 border-red-300'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <span className="font-semibold mr-2">({option.identifier})</span>
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: option.content,
                                  }}
                                />
                                {isCorrectOption && (
                                  <span className="ml-2 text-green-700 font-semibold">✓ Correct</span>
                                )}
                                {isSelected && !isCorrectOption && (
                                  <span className="ml-2 text-red-700 font-semibold">✗ Your Answer</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {response?.freeTextAnswer && (
                        <div className="mt-2">
                          <div className="text-sm text-gray-600 mb-1">Your Answer:</div>
                          <div className="p-2 bg-gray-100 rounded">{response.freeTextAnswer}</div>
                          {question.correct?.integer !== undefined && (
                            <div className="mt-1 text-sm">
                              Correct Answer: {question.correct.integer}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


