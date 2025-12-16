import Link from 'next/link';
import { Exam } from '@/types';

interface ExamCardProps {
  exam: Exam;
}

export default function ExamCard({ exam }: ExamCardProps) {
  const examUrl = `/${exam.boardSlug}/${exam.slug}`;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{exam.name}</h3>
      <div className="flex flex-col gap-3">
        <Link
          href={examUrl}
          className="w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Chapter Wise
        </Link>
        <Link
          href={`${examUrl}/papers`}
          className="w-full px-4 py-2 bg-green-600 text-white text-center rounded-md hover:bg-green-700 transition-colors font-medium"
        >
          Paper Wise
        </Link>
        <Link
          href={`${examUrl}/mock-test`}
          className="w-full px-4 py-2 bg-purple-600 text-white text-center rounded-md hover:bg-purple-700 transition-colors font-medium"
        >
          Mock Test
        </Link>
      </div>
    </div>
  );
}

