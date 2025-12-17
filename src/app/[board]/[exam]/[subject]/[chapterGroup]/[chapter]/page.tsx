import { Metadata } from 'next';
import Link from 'next/link';
import { getBoardBySlug, getExamBySlug, getSubjectBySlug, getChapterGroupBySlug, getChapterBySlug, getQuestionsByChapterId, getChapterGroupsBySubjectId, getAllChapters } from '@/lib/api';
import { Board, Exam, Subject, ChapterGroup, Chapter, Question } from '@/types';
import Navbar from '@/components/Navbar';
import ExamBoardNavbarWrapper from '@/components/ExamBoardNavbarWrapper';
import Footer from '@/components/Footer';

export const revalidate = 60;

interface ChapterPageProps {
    params: Promise<{
        board: string;
        exam: string;
        subject: string;
        chapterGroup: string;
        chapter: string;
    }>;
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
    const { chapter: chapterSlug } = await params;
    const chapter = await getChapterBySlug(chapterSlug).catch(() => null);

    if (!chapter) {
        return {
            title: 'Chapter - Exam Platform',
        };
    }

    return {
        title: `${chapter.name} - Practice Questions`,
        description: `Practice questions for ${chapter.name}`,
    };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
    const { board: boardSlug, exam: examSlug, subject: subjectSlug, chapterGroup: chapterGroupSlug, chapter: chapterSlug } = await params;

    let board: Board | null = null;
    let exam: Exam | null = null;
    let subject: Subject | null = null;
    let chapterGroup: ChapterGroup | null = null;
    let chapter: Chapter | null = null;
    let chapterGroups: ChapterGroup[] = [];
    let allChapters: Chapter[] = [];
    let questions: Question[] = [];
    let error: string | null = null;

    try {
        const fetchedChapter = await getChapterBySlug(chapterSlug).catch(() => null);

        if (!fetchedChapter) {
            throw new Error('Chapter not found');
        }

        chapter = fetchedChapter;

        const [fetchedBoard, fetchedExam, fetchedSubject, fetchedChapterGroup, chapterGroupsData, allChaptersData, questionsData] = await Promise.all([
            getBoardBySlug(boardSlug).catch(() => null),
            getExamBySlug(examSlug).catch(() => null),
            getSubjectBySlug(subjectSlug).catch(() => null),
            getChapterGroupBySlug(chapterGroupSlug).catch(() => null),
            getChapterGroupsBySubjectId(fetchedChapter.subjectId).catch(() => []),
            getAllChapters().catch(() => []),
            getQuestionsByChapterId(fetchedChapter._id).catch(() => []),
        ]);

        board = fetchedBoard;
        exam = fetchedExam;
        subject = fetchedSubject;
        chapterGroup = fetchedChapterGroup;

        chapterGroups = chapterGroupsData.filter((cg: ChapterGroup) => cg.isActive).sort((a: ChapterGroup, b: ChapterGroup) => (a.order || 0) - (b.order || 0));
        allChapters = allChaptersData.filter((c: Chapter) => c.isActive && c.subjectId === fetchedChapter.subjectId).sort((a: Chapter, b: Chapter) => (a.order || 0) - (b.order || 0));
        questions = questionsData.filter((q: Question) => q.isActive);
    } catch (err) {
        error = err instanceof Error ? err.message : 'Failed to load data';
        console.error('Error fetching data:', err);
    }

    if (!board || !exam || !subject || !chapterGroup || !chapter) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <ExamBoardNavbarWrapper />
                <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">Content not found</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const yearGroups = questions.reduce((acc, q) => {
        const year = q.year || 'Practice';
        if (!acc[year]) acc[year] = [];
        acc[year].push(q);
        return acc;
    }, {} as { [key: string]: Question[] });

    const sortedYears = Object.keys(yearGroups).sort((a, b) => {
        if (a === 'Practice') return 1;
        if (b === 'Practice') return -1;
        return Number(b) - Number(a);
    });

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <ExamBoardNavbarWrapper />

            <main className="flex-1 w-full">
                <div className="flex">
                    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0 overflow-y-auto">
                        <div className="p-4">
                            {chapterGroups.map((cg) => {
                                const groupChapters = allChapters.filter(ch => ch.chapterGroupId === cg._id);
                                if (groupChapters.length === 0) return null;

                                return (
                                    <div key={cg._id} className="mb-6">
                                        <h2 className="text-sm font-bold text-gray-900 mb-2 px-3">{cg.name}</h2>
                                        <div className="space-y-1">
                                            {groupChapters.map((ch) => (
                                                <Link
                                                    key={ch._id}
                                                    href={`/${board.slug}/${exam.slug}/${subject.slug}/${cg.slug}/${ch.slug}`}
                                                    className={`block px-3 py-2 rounded text-sm transition-colors ${ch._id === chapter._id
                                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                                            : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {ch.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* {!error && questions.length > 0 && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 px-3">Questions</h3>
                  <nav className="space-y-1">
                    {sortedYears.map(year => (
                      <a
                        key={year}
                        href={`#year-${year}`}
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      >
                        {year === 'Practice' ? 'Practice Questions' : `${year} PYQ Studies`}
                      </a>
                    ))}
                  </nav>
                </div>
              )} */}
                        </div>
                    </aside>

                    <div className="flex-1">
                        <div className="bg-white border-b border-gray-200 px-6 py-4">
                            <Link
                                href={`/${board.slug}/${exam.slug}`}
                                className="text-blue-600 hover:text-blue-800 mb-3 inline-flex items-center gap-2 text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to {exam.name}
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">{chapter.name}</h1>
                            <p className="text-sm text-gray-600 mt-1">{subject.name}</p>
                        </div>

                        <div className="p-6">
                            {error ? (
                                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                                    <p className="text-red-800">{error}</p>
                                </div>
                            ) : questions.length === 0 ? (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                    <p className="text-yellow-800">No questions available for this chapter yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {sortedYears.map(year => (
                                        <section key={year} id={`year-${year}`}>
                                            {/* <div className="mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {year === 'Practice' ? 'Practice Questions' : `${year} PYQ Studies`}
                        </h2>
                      </div> */}
                                            <div className="space-y-6">
                                                {yearGroups[year].map((question: any, index) => (
                                                    <div key={question._id} className="bg-white border border-gray-200 rounded-lg p-6">
                                                        <div className="flex items-start gap-4">
                                                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                                                {index + 1}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                                                                        {question.kind}
                                                                    </span>
                                                                    {question.marks > 0 && (
                                                                        <span className="text-xs text-gray-600">
                                                                            {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
                                                                        </span>
                                                                    )}
                                                                    {question.negMarks > 0 && (
                                                                        <span className="text-xs text-red-600">
                                                                            -{question.negMarks} Negative
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div
                                                                    className="text-gray-900 mb-4 leading-relaxed"
                                                                    dangerouslySetInnerHTML={{ __html: question.prompt?.content || 'Question content not available' }}
                                                                />
                                                                {question.kind === 'MCQ' && question.prompt?.options && (
                                                                    <div className="space-y-2 mb-4">
                                                                        {question.prompt.options.map((option: any) => (
                                                                            <div
                                                                                key={option.identifier}
                                                                                className={`p-3 rounded border ${question.correct?.identifiers?.includes(option.identifier)
                                                                                        ? 'bg-green-50 border-green-300'
                                                                                        : 'bg-gray-50 border-gray-200'
                                                                                    }`}
                                                                            >
                                                                                <span className="font-semibold mr-2">({option.identifier})</span>
                                                                                <span dangerouslySetInnerHTML={{ __html: option.content }} />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                {question.explanation && (
                                                                    <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-400 rounded">
                                                                        <p className="text-sm font-semibold text-green-900 mb-2">Explanation:</p>
                                                                        <div
                                                                            className="text-sm text-gray-800 leading-relaxed"
                                                                            dangerouslySetInnerHTML={{ __html: question.explanation }}
                                                                        />
                                                                    </div>
                                                                )}
                                                                {question.paperTitle && (
                                                                    <p className="text-xs text-gray-500 mt-3">
                                                                        {question.paperTitle}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
