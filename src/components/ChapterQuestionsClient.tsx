"use client";

import { useMemo } from "react";
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

export default function ChapterQuestionsClient({
  questions,
  showOptions,
  showSolution,
}: {
  questions: Question[];
  showOptions: boolean;
  showSolution: boolean;
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

  console.log("questions", questions);

  return (
    <MathJaxTypesetter deps={[showOptions, showSolution, questions.length]}>
      <div className="space-y-8">
        {sortedYears.map((year) => (
          <section key={year} id={`year-${year}`}>
            <div className="space-y-6">
              {yearGroups[year].map((question: any, index: number) => {
                const p = question.prompt?.en ?? question.prompt?.hi;
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

                        {/* Question */}
                        <div
                          className="text-gray-900 mb-4 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: forceInlineMath(p?.content || "Question content not available"),
                          }}
                        />

                        {/* Options */}
                        {showOptions && hasOptions && (
                          <div className="space-y-2 mb-4">
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
                                  <span className="font-semibold mr-2">({option.identifier})</span>
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: forceInlineMath(option.content),
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Explanation */}
                        {showSolution && p?.explanation && (
                          <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-400 rounded">
                            <p className="text-sm font-semibold text-green-900 mb-2">Explanation:</p>
                            <div
                              className="text-sm text-gray-800 leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: forceInlineMath(p.explanation),
                              }}
                            />
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
