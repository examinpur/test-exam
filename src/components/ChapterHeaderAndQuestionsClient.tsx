"use client";

import { useState } from "react";
import Link from "next/link";
import ChapterQuestionsClient from "@/components/ChapterQuestionsClient";
import type { Question } from "@/types";

function ChevronRightIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function ChapterHeaderAndQuestionsClient({
  questions,
  subject,
  chapterGroup,
  chapter,
  hrefs,
}: {
  questions: Question[];
  subject: { name: string; slug: string };
  chapterGroup: { name: string; slug: string };
  chapter: { name: string; slug: string };
  hrefs: { subject: string; chapterGroup: string; chapter: string };
}) {
  const [showOptions, setShowOptions] = useState(true);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <>
      {/* One-row breadcrumb + toggles */}
      <div className="border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href={hrefs.subject} className="text-blue-600 hover:text-blue-800 font-medium">
              {subject.name}
            </Link>
            <ChevronRightIcon />
            <Link href={hrefs.chapterGroup} className="text-blue-600 hover:text-blue-800 font-medium">
              {chapterGroup.name}
            </Link>
            <ChevronRightIcon />
            <Link href={hrefs.chapter} className="text-gray-900 font-semibold">
              {chapter.name}
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={showOptions}
                onChange={(e) => setShowOptions(e.target.checked)}
              />
              Show options
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={showSolution}
                onChange={(e) => setShowSolution(e.target.checked)}
              />
              Show solution
            </label>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="p-6">
        <ChapterQuestionsClient questions={questions} showOptions={showOptions} showSolution={showSolution} />
      </div>
    </>
  );
}
