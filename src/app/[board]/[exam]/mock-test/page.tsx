'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Paper, Exam, Subject, ExamSession } from '@/types';
import { getUserExamSessions, createExamSession, getQuestionsByPaperId } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface MockTestPageProps {
  params: Promise<{
    board: string;
    exam: string;
  }>;
}

// Subject icons based on name
const getSubjectIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('physics')) {
    return (
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      </div>
    );
  }
  if (lowerName.includes('chemistry')) {
    return (
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </div>
    );
  }
  if (lowerName.includes('math')) {
    return (
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }
  if (lowerName.includes('biology')) {
    return (
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
    );
  }
  // Default icon
  return (
    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </div>
  );
};

export default function MockTestPage({ params }: MockTestPageProps) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'subjects' | 'papers' | 'history'>('subjects');
  const [boardSlug, setBoardSlug] = useState('');
  const [examSlug, setExamSlug] = useState('');
  const [examSessions, setExamSessions] = useState<ExamSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const router = useRouter();
  const [userId] = useState('user-123'); // TODO: Get from auth context

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { board, exam: examParam } = await params;
        setBoardSlug(board);
        setExamSlug(examParam);

        // Fetch exam by slug
        const examRes = await fetch(`${API_BASE_URL}/api/v1/exams?slug=${examParam}`);
        const examData = await examRes.json();
        
        if (!examData.success || !examData.data) {
          setError('Exam not found');
          setLoading(false);
          return;
        }

        const fetchedExam = examData.data;
        setExam(fetchedExam);

        // Fetch subjects and papers in parallel
        const [subjectsRes, papersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/subjects?examId=${fetchedExam._id}`),
          fetch(`${API_BASE_URL}/api/v1/papers?examId=${fetchedExam._id}`),
        ]);

        const [subjectsData, papersData] = await Promise.all([
          subjectsRes.json(),
          papersRes.json(),
        ]);

        if (subjectsData.success && subjectsData.data) {
          setSubjects(subjectsData.data);
        }

        if (papersData.success && papersData.data) {
          setPapers(papersData.data);
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  // Get years range from papers for subjects
  const yearsRange = useMemo(() => {
    if (papers.length === 0) return null;
    const years = papers.map(p => p.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    return `${minYear} - ${maxYear}`;
  }, [papers]);

  // Get unique years from papers
  const years = useMemo(() => {
    const uniqueYears = [...new Set(papers.map(p => p.year))].sort((a, b) => b - a);
    return uniqueYears;
  }, [papers]);

  // Filter papers based on search and year
  const filteredPapers = useMemo(() => {
    return papers.filter(paper => {
      const matchesSearch = paper.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesYear = selectedYear === 'All' || paper.year === parseInt(selectedYear);
      return matchesSearch && matchesYear;
    });
  }, [papers, searchQuery, selectedYear]);

  // Group papers by year
  const papersByYear = useMemo(() => {
    const grouped: Record<number, Paper[]> = {};
    filteredPapers.forEach(paper => {
      if (!grouped[paper.year]) {
        grouped[paper.year] = [];
      }
      grouped[paper.year].push(paper);
    });
    return grouped;
  }, [filteredPapers]);

  // Sort years in descending order
  const sortedYears = Object.keys(papersByYear)
    .map(Number)
    .sort((a, b) => b - a);

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Format time helper
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Load exam sessions
  const loadExamSessions = async () => {
    try {
      setLoadingSessions(true);
      const result = await getUserExamSessions(userId);
      if (result.success && result.data) {
        setExamSessions(result.data);
      }
    } catch (err) {
      console.error('Failed to load exam sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Handle start mock test
  const handleStartMockTest = async (paper: Paper) => {
    try {
      // Create a test ID from paper
      const testId = `paper-${paper._id}`;
      
      // Get questions for the paper
      const questions = await getQuestionsByPaperId(paper._id);
      
      // Create exam session
      const sessionResult = await createExamSession({
        userId,
        testId,
        questionOrder: questions.map((q) => q._id),
        ip: typeof window !== 'undefined' ? window.location.hostname : '',
        device: typeof window !== 'undefined' ? navigator.userAgent : '',
        platform: 'web',
      });

      if (sessionResult.success && sessionResult.data) {
        router.push(`/${boardSlug}/${examSlug}/mock-test/${sessionResult.data._id}`);
      } else {
        // If session already exists, navigate to it
        if (sessionResult.statusCode === 200 && sessionResult.data) {
          router.push(`/${boardSlug}/${examSlug}/mock-test/${sessionResult.data._id}`);
        } else {
          alert('Failed to start test: ' + (sessionResult.message || 'Unknown error'));
        }
      }
    } catch (err) {
      console.error('Failed to start mock test:', err);
      alert('Failed to start test. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error || 'Exam not found'}</p>
          </div>
        </main>
      </div>
    );
  }

  const examUrl = `/${boardSlug}/${examSlug}`;

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setActiveTab('subjects')}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'subjects'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Subjects & Papers
            </button>
            <button
              onClick={() => setActiveTab('papers')}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'papers'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Mock Tests
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                loadExamSessions();
              }}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {/* Subjects Section */}
        {activeTab === 'subjects' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Subjects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <div
                  key={subject._id}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                >
                  {/* Top Right Icons */}
                  <div className="flex justify-between items-start mb-4">
                    {getSubjectIcon(subject.name)}
                    <div className="flex gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Subject Info */}
                  <h3 className="text-xl font-semibold mb-2">{subject.name}</h3>
                  <p className="text-gray-500 text-sm mb-1">Chapter wise Questions with Solutions</p>
                  {yearsRange && (
                    <p className="text-gray-400 text-sm mb-4">
                      <span className="text-gray-500">Years:</span> {yearsRange}
                    </p>
                  )}

                  {/* Explore Button */}
                  <Link
                    href={`${examUrl}/${subject.slug}`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Explore Chapters
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>

            {subjects.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500">No subjects available yet.</p>
              </div>
            )}

            {/* Papers Section - Below Subjects */}
            <div className="mt-12">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold">Papers</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search Input */}
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search papers by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    />
                  </div>

                  {/* Year Filter */}
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer text-sm"
                  >
                    <option value="All">All</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Papers List */}
              {filteredPapers.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-gray-500">No papers found matching your criteria.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {sortedYears.map(year => (
                    <div key={year}>
                      {/* Year Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <h3 className="text-xl font-semibold">{year}</h3>
                      </div>

                      {/* Papers Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {papersByYear[year].map((paper, index) => (
                          <div
                            key={paper._id}
                            className="relative bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                          >
                            {/* Paper Title */}
                            <h4 className="text-lg font-semibold mb-3 line-clamp-2 pr-16 text-gray-900">{paper.name}</h4>

                            {/* Date & Time */}
                            {paper.examSchedule && (
                              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <span>
                                  {formatDate(paper.examSchedule.date)}
                                  {paper.examSchedule.startTime && ` at ${formatTime(paper.examSchedule.startTime)}`}
                                </span>
                              </div>
                            )}

                            {/* Shift Info */}
                            {paper.shift && !paper.examSchedule && (
                              <p className="text-sm text-gray-500 mb-3">Shift: {paper.shift}</p>
                            )}

                            {/* Language Badges */}
                            <div className="flex gap-2 mb-4">
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                English
                              </span>
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                Hindi (हिंदी)
                              </span>
                            </div>

                            {/* Question Count */}
                            {paper.questionCount > 0 && (
                              <p className="text-sm text-blue-600 mb-4">{paper.questionCount} questions</p>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <Link
                                href={`${examUrl}/papers/${paper._id}/questions?mode=test`}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                  />
                                </svg>
                                Take Test
                              </Link>
                              <Link
                                href={`${examUrl}/papers/${paper._id}/questions`}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                  />
                                </svg>
                                Practice
                              </Link>
                            </div>

                            {/* Top Right Icons */}
                            <div className="absolute top-4 right-4 flex gap-2">
                              <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                  />
                                </svg>
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mock Tests Tab Content */}
        {activeTab === 'papers' && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Select a paper to start a mock test</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {papers.slice(0, 6).map((paper) => (
                <button
                  key={paper._id}
                  onClick={() => handleStartMockTest(paper)}
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{paper.name}</h3>
                  <p className="text-sm text-gray-600">{paper.questionCount} questions</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* History Tab Content */}
        {activeTab === 'history' && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Test History</h2>
            {loadingSessions ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : examSessions.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500">No test history found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {examSessions.map((session) => (
                  <div
                    key={session._id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Test ID: {session.testId}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            Started: {session.startedAt ? new Date(session.startedAt).toLocaleString() : 'N/A'}
                          </span>
                          {session.submittedAt && (
                            <span>
                              Submitted: {new Date(session.submittedAt).toLocaleString()}
                            </span>
                          )}
                          {session.status === 'evaluated' && (
                            <>
                              <span className="font-semibold text-green-600">
                                Score: {session.totalMarks || 0}
                              </span>
                              <span className="font-semibold">
                                Accuracy: {session.accuracy?.toFixed(1) || 0}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            session.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : session.status === 'evaluated'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {session.status === 'in_progress' ? 'In Progress' : 
                           session.status === 'evaluated' ? 'Completed' : 
                           session.status || 'Unknown'}
                        </span>
                        {session.status === 'in_progress' ? (
                          <Link
                            href={`/${boardSlug}/${examSlug}/mock-test/${session._id}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Resume
                          </Link>
                        ) : session.status === 'evaluated' ? (
                          <Link
                            href={`/${boardSlug}/${examSlug}/mock-test/results/${session._id}`}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            View Results
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

