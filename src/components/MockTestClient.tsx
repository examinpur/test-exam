"use client";

import { useState, useEffect, useMemo } from "react";
import type { Question, QuestionResponse, ExamSession } from "@/types";
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

interface MockTestClientProps {
  questions: Question[];
  session: ExamSession;
  onResponseChange: (questionId: string, response: Partial<QuestionResponse>) => void;
  onSubmit: () => void;
  timeRemaining?: number; // in milliseconds
}

export default function MockTestClient({
  questions,
  session,
  onResponseChange,
  onSubmit,
  timeRemaining,
}: MockTestClientProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

  // Get responses map
  const responsesMap = useMemo(() => {
    const map = new Map<string, QuestionResponse>();
    if (session.responses) {
      session.responses.forEach((resp) => {
        map.set(String(resp.questionId), resp);
      });
    }
    return map;
  }, [session.responses]);

  // Initialize flagged questions
  useEffect(() => {
    if (session.responses) {
      const flagged = new Set<string>();
      session.responses.forEach((resp) => {
        if (resp.flagged) {
          flagged.add(String(resp.questionId));
        }
      });
      setFlaggedQuestions(flagged);
    }
  }, [session.responses]);

  const currentQuestion = questions[currentQuestionIndex];
  const currentResponse = currentQuestion ? responsesMap.get(currentQuestion._id) : undefined;

  const handleOptionSelect = (identifier: string, isMultiple: boolean) => {
    if (!currentQuestion) return;

    const existing = currentResponse?.chosenIdentifiers || [];
    let newIdentifiers: string[];

    if (isMultiple) {
      // Toggle for MSQ
      if (existing.includes(identifier)) {
        newIdentifiers = existing.filter((id) => id !== identifier);
      } else {
        newIdentifiers = [...existing, identifier];
      }
    } else {
      // Single select for MCQ/TRUE_FALSE
      newIdentifiers = [identifier];
    }

    onResponseChange(currentQuestion._id, {
      questionId: currentQuestion._id,
      chosenIdentifiers: newIdentifiers,
      order: currentQuestionIndex + 1,
      flagged: currentResponse?.flagged || false,
    });
  };

  const handleFreeTextChange = (value: string) => {
    if (!currentQuestion) return;

    onResponseChange(currentQuestion._id, {
      questionId: currentQuestion._id,
      freeTextAnswer: value,
      order: currentQuestionIndex + 1,
      flagged: currentResponse?.flagged || false,
    });
  };

  const handleFlagToggle = () => {
    if (!currentQuestion) return;

    const newFlagged = !flaggedQuestions.has(currentQuestion._id);
    const newSet = new Set(flaggedQuestions);
    if (newFlagged) {
      newSet.add(currentQuestion._id);
    } else {
      newSet.delete(currentQuestion._id);
    }
    setFlaggedQuestions(newSet);

    onResponseChange(currentQuestion._id, {
      questionId: currentQuestion._id,
      flagged: newFlagged,
      order: currentQuestionIndex + 1,
      chosenIdentifiers: currentResponse?.chosenIdentifiers || [],
      freeTextAnswer: currentResponse?.freeTextAnswer,
    });
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  const answeredCount = useMemo(() => {
    return session.responses?.filter(
      (r) => (r.chosenIdentifiers && r.chosenIdentifiers.length > 0) || r.freeTextAnswer
    ).length || 0;
  }, [session.responses]);

  if (!currentQuestion) {
    return <div>No questions available</div>;
  }

  const p = currentQuestion.prompt?.en ?? currentQuestion.prompt?.hi;
  const options = p?.options ?? [];
  const isMultiple = currentQuestion.kind === "MSQ";
  const isInteger = currentQuestion.kind === "INTEGER" || currentQuestion.kind === "FILL_BLANK";

  return (
    <MathJaxTypesetter deps={[currentQuestionIndex, session.responses?.length]}>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar - Question Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Questions</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const resp = responsesMap.get(q._id);
                const isAnswered = (resp?.chosenIdentifiers && resp.chosenIdentifiers.length > 0) || resp?.freeTextAnswer;
                const isFlagged = flaggedQuestions.has(q._id);
                const isCurrent = idx === currentQuestionIndex;

                return (
                  <button
                    key={q._id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`
                      w-10 h-10 rounded text-xs font-medium transition-colors
                      ${isCurrent
                        ? "bg-blue-600 text-white ring-2 ring-blue-300"
                        : isAnswered
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                      }
                      ${isFlagged ? "ring-2 ring-yellow-400" : ""}
                    `}
                    title={`Question ${idx + 1}${isFlagged ? " (Flagged)" : ""}`}
                  >
                    {idx + 1}
                    {isFlagged && <span className="absolute -top-1 -right-1 text-yellow-500">🚩</span>}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span className="text-gray-600">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                <span className="text-gray-600">Not answered</span>
              </div>
            </div>

            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Progress</div>
              <div className="text-lg font-semibold text-blue-900">
                {answeredCount} / {questions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h2>
              </div>
              <div className="flex items-center gap-4">
                {timeRemaining !== undefined && (
                  <div className={`px-4 py-2 rounded-lg font-mono font-semibold ${
                    timeRemaining < 300000 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {formatTime(timeRemaining)}
                  </div>
                )}
                <button
                  onClick={handleFlagToggle}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    flaggedQuestions.has(currentQuestion._id)
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                      : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {flaggedQuestions.has(currentQuestion._id) ? "🚩 Flagged" : "Flag"}
                </button>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                    {currentQuestion.kind}
                  </span>
                  {currentQuestion.marks > 0 && (
                    <span className="text-xs text-gray-600">
                      {currentQuestion.marks} {currentQuestion.marks === 1 ? "Mark" : "Marks"}
                    </span>
                  )}
                  {currentQuestion.negMarks > 0 && (
                    <span className="text-xs text-red-600">-{currentQuestion.negMarks} Negative</span>
                  )}
                </div>

                <div
                  className="text-gray-900 mb-6 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: forceInlineMath(p?.content || "Question content not available"),
                  }}
                />

                {options.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {options.map((option: any) => {
                      const isSelected = currentResponse?.chosenIdentifiers?.includes(option.identifier) || false;

                      return (
                        <button
                          key={option.identifier}
                          onClick={() => handleOptionSelect(option.identifier, isMultiple)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                            isSelected
                              ? "bg-blue-50 border-blue-500 text-gray-900"
                              : "bg-gray-50 border-gray-200 text-gray-900 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-300"
                            }`}>
                              {isSelected && (
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <span className="font-semibold mr-2">({option.identifier})</span>
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: forceInlineMath(option.content),
                                }}
                              />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {isInteger && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Answer:
                    </label>
                    <input
                      type="number"
                      value={currentResponse?.freeTextAnswer || ""}
                      onChange={(e) => handleFreeTextChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your answer"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center gap-3">
                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={onSubmit}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Submit Test
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MathJaxTypesetter>
  );
}


