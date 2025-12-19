"use client";

import { useState } from "react";
import Link from "next/link";
import ChapterQuestionsClient from "@/components/ChapterQuestionsClient";
import { PrintExamModal } from "@/components/PrintableExamSheet";
import type { Question } from "@/types";

function ChevronRightIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
      />
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
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");

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

          <div className="flex items-center gap-4">
            {/* Print Button */}
            <button
              onClick={() => setShowPrintModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <PrintIcon />
              Download PDF
            </button>

            <div className="flex items-center gap-6">
              {/* Language toggle */}
              <div className="flex items-center gap-1 text-sm">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-2 py-0.5 rounded border text-xs ${
                    language === "en"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("hi")}
                  className={`px-2 py-0.5 rounded border text-xs ${
                    language === "hi"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  HI
                </button>
              </div>

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
      </div>

      {/* Questions */}
      <div className="p-6">
        <ChapterQuestionsClient
          questions={questions}
          showOptions={showOptions}
          showSolution={showSolution}
          language={language}
        />
      </div>

      {/* Print Modal */}
      <PrintExamModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        questions={questions}
        subject={subject.name}
        chapterGroup={chapterGroup.name}
        chapter={chapter.name}
        language={language}
      />
    </>
  );
}
