"use client";

import { useMemo } from "react";
import Image from "next/image";
import type { Question } from "@/types";
import MathJaxTypesetter from "./MathJaxTypesetter";

// Fix DB strings like \\vec -> \vec (MathJax treats \\ as a newline)
function normalizeLatex(s: string) {
  return (s || "").replace(/\\\\/g, "\\");
}

// Convert $$...$$ and \[...\] to inline \( ... \) so it won't break lines
function forceInlineMath(input: string): string {
  return normalizeLatex(input)
    .replace(/\$\$([\s\S]+?)\$\$/g, (_m, body) => `\\(${String(body).trim()}\\)`)
    .replace(/\\\[([\s\S]+?)\\\]/g, (_m, body) => `\\(${String(body).trim()}\\)`);
}

function ImageGallery({ images }: { images: any[] }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="my-3 flex flex-nowrap gap-2 overflow-x-auto">
      {images.map((img, idx) => (
        <div
          key={idx}
          className="relative flex-shrink-0 w-32 h-32 bg-white rounded-lg overflow-hidden border border-gray-200"
          style={{ width: '128px', height: '128px', minWidth: '128px', minHeight: '128px', maxWidth: '128px', maxHeight: '128px' }}
        >
          <Image
            src={img.url || `https://res.cloudinary.com/dvh5crcf9/image/upload/v${img.version}/${img.publicId}`}
            alt={img.alt || `Question image ${idx + 1}`}
            fill
            className="object-contain"
            style={{ objectFit: 'contain' }}
            sizes="128px"
          />
        </div>
      ))}
    </div>
  );
}

export default function ChapterQuestionsClient({
  questions,
  showOptions,
  showSolution,
  language,
}: {
  questions: Question[];
  showOptions: boolean;
  showSolution: boolean;
  language: "en" | "hi";
}) {
  const { yearGroups, sortedYears } = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const q of questions as any[]) {
      const year = q.year ? String(q.year) : "Practice";
      (groups[year] ||= []).push(q);
    }
    const years = Object.keys(groups).sort((a, b) => {
      if (a === "Practice") return 1;
      if (b === "Practice") return -1;
      return Number(b) - Number(a);
    });
    return { yearGroups: groups, sortedYears: years };
  }, [questions]);

  return (
    <MathJaxTypesetter deps={[showOptions, showSolution, questions.length, language]}>
      <div className="space-y-8">
        {sortedYears.map((year) => (
          <section key={year} id={`year-${year}`}>
            <div className="space-y-6">
              {yearGroups[year].map((question: any, index: number) => {
                const preferred = language;
                const fallback = language === "en" ? "hi" : "en";
                const p = question.prompt?.[preferred] ?? question.prompt?.[fallback];
                const options = p?.options ?? [];
                const hasOptions = options.length > 0;

                return (
                  <div
                    key={question._id}
                    data-mathjax
                    className="bg-white border border-gray-200 rounded-lg p-6"
                  >
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
                              {question.marks} {question.marks === 1 ? "Mark" : "Marks"}
                            </span>
                          )}

                          {question.negMarks > 0 && (
                            <span className="text-xs text-red-600">-{question.negMarks} Negative</span>
                          )}
                        </div>
                        <div
                          className="text-gray-900 mb-4 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: forceInlineMath(p?.content || "Question content not available"),
                          }}
                        />
                         {p?.images && p.images.length > 0 && (
                          <ImageGallery images={p.images} />
                        )}
                        {showOptions && hasOptions && (
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {options.map((option: any) => {
                              const isCorrect = question.correct?.identifiers?.includes(option.identifier);
                              const highlight = showSolution && isCorrect;

                              return (
                                <div
                                  key={option.identifier}
                                  className={`p-3 rounded border ${
                                    highlight
                                      ? "bg-green-50 border-green-300 text-gray-900"
                                      : "bg-gray-50 border-gray-200 text-gray-900"
                                  }`}
                                >
                                   <div className="flex items-start gap-2">
                                    <span className="font-semibold flex-shrink-0">({option.identifier})</span>
                                    <div className="flex-1">
                                      <span
                                        dangerouslySetInnerHTML={{
                                          __html: forceInlineMath(option.content),
                                        }}
                                      />
                                      {/* Option Images */}
                                      {option.images && option.images.length > 0 && (
                                        <div className="mt-2">
                                          <ImageGallery images={option.images} />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Explanation */}
                        {showSolution && (p?.explanation || (p?.explanationImages && p.explanationImages.length > 0)) && (
                          <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-400 rounded">
                            {p?.explanation && (
                              <>
                                <p className="text-sm font-semibold text-green-900 mb-2">Explanation:</p>
                                <div
                                  className="text-sm text-gray-800 leading-relaxed"
                                  dangerouslySetInnerHTML={{
                                    __html: forceInlineMath(p.explanation),
                                  }}
                                />
                              </>
                            )}
                            {/* Explanation Images */}
                            {p?.explanationImages && p.explanationImages.length > 0 && (
                              <div className={p?.explanation ? "mt-3" : ""}>
                                <ImageGallery images={p.explanationImages} />
                              </div>
                            )}
                          </div>
                        )}
                        {question.paperTitle && (
                          <p className="text-xs text-gray-500 mt-3">{question.paperTitle}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </MathJaxTypesetter>
  );
}
