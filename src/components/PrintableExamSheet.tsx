"use client";

import { useState, useEffect, useRef } from "react";
import type { Question } from "@/types";
import MathJaxTypesetter from "./MathJaxTypesetter";

// Normalize LaTeX and convert to inline math
const formatMath = (s: string) =>
  (s || "")
    .replace(/\\\\/g, "\\")
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, b) => `\\(${b.trim()}\\)`)
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, b) => `\\(${b.trim()}\\)`);

interface ExamConfig {
  instituteName: string;
  studentName: string;
  testName: string;
  date: string;
  duration: string;
}

const PrintImageGallery = ({ images }: { images: any[] }) => {
  if (!images || images.length === 0) return null;
  return (
    <div className="print-images-grid">
      {images.map((img, idx) => (
        <div
          key={idx}
          className="print-image-container"
          style={{ 
            width: '100px', 
            height: '100px', 
            minWidth: '100px', 
            minHeight: '100px', 
            maxWidth: '100px', 
            maxHeight: '100px' 
          }}
        >
          <img
            src={img.url || `https://res.cloudinary.com/dvh5crcf9/image/upload/v${img.version}/${img.publicId}`}
            alt={img.alt || `Question image ${idx + 1}`}
            className="print-image"
            style={{ objectFit: 'contain', width: '100%', height: '100%' }}
          />
        </div>
      ))}
    </div>
  );
};

// Reusable Question Component
const QuestionItem = ({ question, index, showOptions, showSolution, language }: {
  question: Question;
  index: number;
  showOptions: boolean;
  showSolution: boolean;
  language: "en" | "hi";
}) => {
  const preferred = language;
  const fallback = language === "en" ? "hi" : "en";
  const p = (question as any).prompt?.[preferred] ?? (question as any).prompt?.[fallback];
  const options = p?.options ?? [];

  return (
    <div className="print-question">
      <div className="question-row">
        <span className="question-number">{index}.</span>
        <div className="question-body">
          <div className="print-math-content question-text" dangerouslySetInnerHTML={{ __html: formatMath(p?.content || "") }} />
          {p?.images && p.images.length > 0 && <PrintImageGallery images={p.images} />}
          {showOptions && options.length > 0 && (
            <div className="options-grid">
              {options.map((opt: any) => (
                <div key={opt.identifier} className={`option-item ${showSolution && question.correct?.identifiers?.includes(opt.identifier) ? "correct-answer" : ""}`}>
                  <div className="option-text-row">
                    <span className="option-label">({opt.identifier})</span>
                    <span className="print-math-content" dangerouslySetInnerHTML={{ __html: formatMath(opt.content) }} />
                  </div>
                  {opt.images && opt.images.length > 0 && (
                    <div className="option-images-wrapper">
                      <PrintImageGallery images={opt.images} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {showSolution && p?.explanationImages && p.explanationImages.length > 0 && (
            <div className="explanation-images">
              <PrintImageGallery images={p.explanationImages} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Section Component
const Section = ({ title, questions, startIndex, showOptions, showSolution, language }: {
  title: string;
  questions: Question[];
  startIndex: number;
  showOptions: boolean;
  showSolution: boolean;
  language: "en" | "hi";
}) => {
  if (!questions.length) return null;
  const marks = questions[0]?.marks || 4;
  const negMarks = questions[0]?.negMarks || 0;

  return (
    <div className="section-block">
      <div className="section-header">
        <h3>{title}</h3>
        <ul>
          <li>This section contains <strong>{questions.length}</strong> questions.</li>
          <li>Each question has <strong>FOUR</strong> options (A), (B), (C) and (D). <strong>ONLY ONE</strong> is correct.</li>
          <li>
            Marking scheme:
            <div className="marking-scheme">
              <div><em>Full Marks</em>: <strong>+{marks}</strong></div>
              <div><em>Zero Marks</em>: <strong>0</strong></div>
              {negMarks > 0 && <div><em>Negative Marks</em>: <strong>-{negMarks}</strong></div>}
            </div>
          </li>
        </ul>
      </div>
      <div className="questions-columns">
        {questions.map((q, i) => (
          <QuestionItem
            key={q._id}
            question={q}
            index={startIndex + i}
            showOptions={showOptions}
            showSolution={showSolution}
            language={language}
          />
        ))}
      </div>
    </div>
  );
};

// Main Exam Sheet Component
const ExamSheet = ({ questions, config, subject, showOptions, showSolution, language }: {
  questions: Question[];
  config: ExamConfig;
  subject: string;
  showOptions: boolean;
  showSolution: boolean;
  language: "en" | "hi";
}) => {
  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  const mcq = questions.filter(q => ["MCQ", "MSQ", "TRUE_FALSE"].includes(q.kind));
  const numerical = questions.filter(q => ["INTEGER", "FILL_BLANK"].includes(q.kind));
  const other = questions.filter(q => !["MCQ", "MSQ", "TRUE_FALSE", "INTEGER", "FILL_BLANK"].includes(q.kind));

  let idx = 1;

  return (
    <div className="print-container">
      <div className="exam-header">
        <h1 className="institute-name">{config.instituteName}</h1>
        <div className="exam-meta">
          <div className="meta-left">
            <div><strong>Subject:</strong> {subject}</div>
            <div><strong>Total Marks:</strong> {totalMarks}</div>
          </div>
          <div className="meta-center"><span className="test-name">{config.testName}</span></div>
          <div className="meta-right">
            <div><strong>Date:</strong> {config.date}</div>
            <div><strong>Hours:</strong> {config.duration}</div>
          </div>
        </div>
        {config.studentName && <div className="student-name"><strong>Student Name:</strong> {config.studentName}</div>}
      </div>
      <hr className="header-divider" />
      <div className="exam-content">
        {mcq.length > 0 && (
          <Section
            title="Section A (MCQ)"
            questions={mcq}
            startIndex={idx}
            showOptions={showOptions}
            showSolution={showSolution}
            language={language}
          />
        )}
        {(idx += mcq.length, numerical.length > 0) && (
          <Section
            title="Section B (Numerical)"
            questions={numerical}
            startIndex={idx}
            showOptions={showOptions}
            showSolution={showSolution}
            language={language}
          />
        )}
        {(idx += numerical.length, other.length > 0) && (
          <Section
            title="Section C"
            questions={other}
            startIndex={idx}
            showOptions={showOptions}
            showSolution={showSolution}
            language={language}
          />
        )}
        {!mcq.length && !numerical.length && !other.length && (
          <div className="questions-columns">
            {questions.map((q, i) => (
              <QuestionItem
                key={q._id}
                question={q}
                index={i + 1}
                showOptions={showOptions}
                showSolution={showSolution}
                language={language}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Print Modal Component
export function PrintExamModal({ isOpen, onClose, questions, subject, chapter, language }: {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  subject: string;
  chapterGroup: string;
  chapter: string;
  language: "en" | "hi";
}) {
  const [config, setConfig] = useState<ExamConfig>({
    instituteName: "ABC Institute",
    studentName: "",
    testName: `${chapter} - Test`,
    date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }),
    duration: "3 Hours",
  });
  const [showOptions, setShowOptions] = useState(true);
  const [showSolution, setShowSolution] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const handlePrint = () => {
    let printRoot = document.getElementById("print-root");
    if (!printRoot) {
      printRoot = document.createElement("div");
      printRoot.id = "print-root";
      document.body.appendChild(printRoot);
    }
  
    if (!previewRef.current) return;
  
    printRoot.innerHTML = `<div class="print-watermark">coderoof</div>${previewRef.current.innerHTML}`;
    printRoot.style.display = "block";
  
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        @page { size: A4; margin: 6mm; }
  
        /* Optional: print ONLY the print-root */
        body > *:not(#print-root) { display: none !important; }
        #print-root { display: block !important; }
  
        #print-root .print-container { padding: 0 !important; }
  
        /* ✅ FORCE masonry-like columns in print (avoid grid row blank spaces) */
        #print-root .questions-columns {
          display: block !important;           /* kills grid/flex if any */
          column-count: 2 !important;
          column-gap: 8px !important;
          column-fill: auto !important;
          -webkit-column-fill: auto !important;
        }
  
        /* ✅ Allow questions to split when needed (no big blank gaps) */
        #print-root .print-question {
          margin-bottom: 2px !important;
          break-inside: auto !important;
          page-break-inside: auto !important;
          -webkit-column-break-inside: auto !important;
        }
  
        /* Flex/grid often refuse to fragment; make the question row printable */
        #print-root .question-row { display: block !important; }
        #print-root .question-number {
          display: inline-block !important;
          width: 14px !important;
          vertical-align: top !important;
        }
        #print-root .question-body { display: inline !important; }
  
        /* ✅ Grid doesn't fragment nicely in print; convert options to inline-block 2-col */
        #print-root .options-grid {
          display: block !important;           /* kill grid */
          margin-top: 1px !important;
        }
        #print-root .option-item {
          display: inline-block !important;
          width: 49% !important;              /* 2 columns */
          vertical-align: top !important;
          margin: 0 0 2px 0 !important;
          break-inside: avoid !important;      /* keep each option together */
          -webkit-column-break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
  
        /* ✅ Same idea for images */
        #print-root .print-images-grid {
          display: block !important;           /* kill grid */
          margin: 1px 0 !important;
        }
        #print-root .print-image-container {
          display: inline-block !important;
          width: 100px !important;
          height: 100px !important;
          vertical-align: top !important;
          margin: 1px !important;
          break-inside: avoid !important;
          -webkit-column-break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
  
        /* Keep section header from being stranded alone */
        #print-root .section-header {
          break-inside: avoid !important;
          -webkit-column-break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
      }
    `;
    document.head.appendChild(style);
  
    const MJ = (window as any).MathJax;
  
    const cleanup = () => {
      printRoot!.style.display = "none";
      style.remove();
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
  
    const doPrint = () => window.print();
  
    if (MJ?.typesetPromise) {
      MJ.typesetClear?.([printRoot]);
      MJ.typesetPromise([printRoot]).then(doPrint).catch(doPrint);
    } else {
      doPrint();
    }
  };
  

  if (!isOpen) return null;

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden print-hidden">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-4 bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Print Exam Paper</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Config Panel */}
          <div className="w-72 border-r bg-gray-50 p-4 overflow-y-auto space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">Configuration</h3>
            {[
              { label: "Institute Name", key: "instituteName" },
              { label: "Student Name", key: "studentName", placeholder: "Optional" },
              { label: "Test Name", key: "testName" },
              { label: "Date", key: "date" },
              { label: "Duration", key: "duration" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="text"
                  value={config[key as keyof ExamConfig]}
                  onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
            ))}
            <div className="border-t pt-3 mt-3 space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showOptions} onChange={(e) => setShowOptions(e.target.checked)} className="h-4 w-4" />
                Show Options
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showSolution} onChange={(e) => setShowSolution(e.target.checked)} className="h-4 w-4" />
                Show Solutions
              </label>
            </div>
            <div className="border-t pt-3 mt-3 text-sm text-gray-600">
              <div><strong>Questions:</strong> {questions.length}</div>
              <div><strong>Total Marks:</strong> {totalMarks}</div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 overflow-auto bg-gray-200 p-4">
            <MathJaxTypesetter deps={[isOpen, showOptions, showSolution, config, language]}>
              <div ref={previewRef} className="a4-preview mx-auto bg-white shadow-lg">
                <ExamSheet
                  questions={questions}
                  config={config}
                  subject={subject}
                  showOptions={showOptions}
                  showSolution={showSolution}
                  language={language}
                />
              </div>
            </MathJaxTypesetter>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-white border rounded-md hover:bg-gray-50">Cancel</button>
          <button onClick={handlePrint} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExamSheet;
