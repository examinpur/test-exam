// "use client";

// import { useState, useEffect, useRef } from "react";
// import type { Question } from "@/types";
// import MathJaxTypesetter from "./MathJaxTypesetter";

// // Normalize LaTeX and convert to inline math
// const formatMath = (s: string) =>
//   (s || "")
//     .replace(/\\\\/g, "\\")
//     .replace(/\$\$([\s\S]+?)\$\$/g, (_, b) => `\\(${b.trim()}\\)`)
//     .replace(/\\\[([\s\S]+?)\\\]/g, (_, b) => `\\(${b.trim()}\\)`);

// const chunk = <T,>(arr: T[], size: number) => {
//   const out: T[][] = [];
//   for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
//   return out;
// };

// interface ExamConfig {
//   instituteName: string;
//   studentName: string;
//   testName: string;
//   date: string;
//   duration: string;
// }

// const PrintImageRow = ({ row }: { row: any[] }) => {
//   return (
//     <div className="print-images-row">
//       {row.map((img, idx) => (
//         <div
//           key={img?.publicId ?? img?.url ?? idx}
//           className="print-image-container"
//           style={{
//             width: "100px",
//             height: "100px",
//             minWidth: "100px",
//             minHeight: "100px",
//             maxWidth: "100px",
//             maxHeight: "100px",
//           }}
//         >
//           <img
//             src={
//               img.url ||
//               `https://res.cloudinary.com/dvh5crcf9/image/upload/v${img.version}/${img.publicId}`
//             }
//             alt={img.alt || `Image ${idx + 1}`}
//             className="print-image"
//             style={{ objectFit: "contain", width: "100%", height: "100%" }}
//           />
//         </div>
//       ))}
//     </div>
//   );
// };

// const PrintImageGallery = ({ images }: { images: any[] }) => {
//   if (!images || images.length === 0) return null;
//   const rows = chunk(images, 3);
//   return (
//     <div className="print-images-grid">
//       {rows.map((row, rIdx) => (
//         <PrintImageRow key={rIdx} row={row} />
//       ))}
//     </div>
//   );
// };

// const QuestionItem = ({
//   question,
//   index,
//   showOptions,
//   showSolution,
//   language,
// }: {
//   question: Question;
//   index: number;
//   showOptions: boolean;
//   showSolution: boolean;
//   language: "en" | "hi";
// }) => {
//   const preferred = language;
//   const fallback = language === "en" ? "hi" : "en";
//   const p =
//     (question as any).prompt?.[preferred] ?? (question as any).prompt?.[fallback];

//   const options = p?.options ?? [];
//   const qImageRows = chunk(p?.images || [], 3);
//   const qFirstRow = qImageRows[0] ?? [];
//   const qRestRows = qImageRows.slice(1);
//   const optionRows = chunk(options, 2);
//   const firstOptionRow = optionRows[0] ?? [];
//   const restOptionRows = optionRows.slice(1);

//   const renderOptionItem = (opt: any) => {
//     const isCorrect =
//       showSolution && question.correct?.identifiers?.includes(opt.identifier);

//     // Option images in rows of 3
//     const oImageRows = chunk(opt.images || [], 3);
//     const oFirstRow = oImageRows[0] ?? [];
//     const oRestRows = oImageRows.slice(1);

//     return (
//       <div
//         key={opt.identifier}
//         className={`option-item ${isCorrect ? "correct-answer" : ""}`}
//       >
//         {/* Keep option text + first option-image-row together */}
//         <div className="keep-with-first-row keep-with-first-options">
//           <div className="option-text-row">
//             <span className="option-label">({opt.identifier})</span>
//             <span
//               className="print-math-content"
//               dangerouslySetInnerHTML={{ __html: formatMath(opt.content) }}
//             />
//           </div>

//           {oFirstRow.length > 0 && (
//             <div className="option-images-wrapper">
//               <div className="print-images-grid">
//                 <PrintImageRow row={oFirstRow} />
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Remaining option image rows */}
//         {oRestRows.length > 0 && (
//           <div className="option-images-wrapper">
//             <div className="print-images-grid">
//               {oRestRows.map((row: any[], rIdx: number) => (
//                 <PrintImageRow key={rIdx} row={row} />
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="print-question">
//       <div className="question-row">
//         <span className="question-number">{index}.</span>

//         <div className="question-body">
//           {/* CASE 1: Question has images → keep text + FIRST image row together */}
//           {qFirstRow.length > 0 ? (
//             <>
//               <div className="keep-with-first-row">
//                 <span
//                   className="print-math-content question-text"
//                   dangerouslySetInnerHTML={{ __html: formatMath(p?.content || "") }}
//                 />
//                 <div className="print-images-grid">
//                   <PrintImageRow row={qFirstRow} />
//                 </div>
//               </div>

//               {/* Remaining image rows can flow */}
//               {qRestRows.length > 0 && (
//                 <div className="print-images-grid">
//                   {qRestRows.map((row, rIdx) => (
//                     <PrintImageRow key={rIdx} row={row} />
//                   ))}
//                 </div>
//               )}

//               {/* Options (all rows) */}
//               {showOptions && options.length > 0 && (
//                 <div className="options-grid">
//                   {optionRows.map((row, rIdx) => (
//                     <div key={rIdx} className="options-row">
//                       {row.map(renderOptionItem)}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </>
//           ) : (
//             /* CASE 2: No question images → keep text + FIRST OPTIONS ROW together */
//             <>
//               <div className="keep-with-first-row keep-with-first-options">

//                 <span
//                   className="print-math-content question-text"
//                   dangerouslySetInnerHTML={{ __html: formatMath(p?.content || "") }}
//                 />

//                 {showOptions && firstOptionRow.length > 0 && (
//                   <div className="options-grid">
//                     <div className="options-row">
//                       {firstOptionRow.map(renderOptionItem)}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Remaining option rows flow after */}
//               {showOptions && restOptionRows.length > 0 && (
//                 <div className="options-grid">
//                   {restOptionRows.map((row, rIdx) => (
//                     <div key={rIdx} className="options-row">
//                       {row.map(renderOptionItem)}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </>
//           )}

//           {/* Explanation images (optional) */}
//           {showSolution &&
//             p?.explanationImages &&
//             p.explanationImages.length > 0 && (
//               <div className="explanation-images">
//                 <PrintImageGallery images={p.explanationImages} />
//               </div>
//             )}
//         </div>
//       </div>
//     </div>
//   );
// };


// // Section Component
// const Section = ({
//   title,
//   questions,
//   startIndex,
//   showOptions,
//   showSolution,
//   language,
// }: {
//   title: string;
//   questions: Question[];
//   startIndex: number;
//   showOptions: boolean;
//   showSolution: boolean;
//   language: "en" | "hi";
// }) => {
//   if (!questions.length) return null;
//   const marks = questions[0]?.marks || 4;
//   const negMarks = questions[0]?.negMarks || 0;

//   return (
//     <div className="section-block">
//       <div className="section-header">
//         <h3>{title}</h3>
//         <ul>
//           <li>
//             This section contains <strong>{questions.length}</strong> questions.
//           </li>
//           <li>
//             Each question has <strong>FOUR</strong> options (A), (B), (C) and (D).{" "}
//             <strong>ONLY ONE</strong> is correct.
//           </li>
//           <li>
//             Marking scheme:
//             <div className="marking-scheme">
//               <div>
//                 <em>Full Marks</em>: <strong>+{marks}</strong>
//               </div>
//               <div>
//                 <em>Zero Marks</em>: <strong>0</strong>
//               </div>
//               {negMarks > 0 && (
//                 <div>
//                   <em>Negative Marks</em>: <strong>-{negMarks}</strong>
//                 </div>
//               )}
//             </div>
//           </li>
//         </ul>
//       </div>

//       <div className="questions-columns">
//         {questions.map((q, i) => (
//           <QuestionItem
//             key={(q as any)._id ?? `${startIndex + i}`}
//             question={q}
//             index={startIndex + i}
//             showOptions={showOptions}
//             showSolution={showSolution}
//             language={language}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// // Main Exam Sheet Component
// const ExamSheet = ({
//   questions,
//   config,
//   subject,
//   showOptions,
//   showSolution,
//   language,
// }: {
//   questions: Question[];
//   config: ExamConfig;
//   subject: string;
//   showOptions: boolean;
//   showSolution: boolean;
//   language: "en" | "hi";
// }) => {
//   const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
//   const mcq = questions.filter((q) => ["MCQ", "MSQ", "TRUE_FALSE"].includes(q.kind));
//   const numerical = questions.filter((q) =>
//     ["INTEGER", "FILL_BLANK"].includes(q.kind)
//   );
//   const other = questions.filter(
//     (q) =>
//       !["MCQ", "MSQ", "TRUE_FALSE", "INTEGER", "FILL_BLANK"].includes(q.kind)
//   );

//   let idx = 1;

//   return (
//     <div className="print-container">
//       <div className="exam-header">
//         <h1 className="institute-name">{config.instituteName}</h1>
//         <div className="exam-meta">
//           <div className="meta-left">
//             <div>
//               <strong>Subject:</strong> {subject}
//             </div>
//             <div>
//               <strong>Total Marks:</strong> {totalMarks}
//             </div>
//           </div>
//           <div className="meta-center">
//             <span className="test-name">{config.testName}</span>
//           </div>
//           <div className="meta-right">
//             <div>
//               <strong>Date:</strong> {config.date}
//             </div>
//             <div>
//               <strong>Hours:</strong> {config.duration}
//             </div>
//           </div>
//         </div>
//         {config.studentName && (
//           <div className="student-name">
//             <strong>Student Name:</strong> {config.studentName}
//           </div>
//         )}
//       </div>

//       <hr className="header-divider" />

//       <div className="exam-content">
//         {mcq.length > 0 && (
//           <Section
//             title="Section A (MCQ)"
//             questions={mcq}
//             startIndex={idx}
//             showOptions={showOptions}
//             showSolution={showSolution}
//             language={language}
//           />
//         )}

//         {(idx += mcq.length) && numerical.length > 0 && (
//           <Section
//             title="Section B (Numerical)"
//             questions={numerical}
//             startIndex={idx}
//             showOptions={showOptions}
//             showSolution={showSolution}
//             language={language}
//           />
//         )}

//         {(idx += numerical.length) && other.length > 0 && (
//           <Section
//             title="Section C"
//             questions={other}
//             startIndex={idx}
//             showOptions={showOptions}
//             showSolution={showSolution}
//             language={language}
//           />
//         )}

//         {!mcq.length && !numerical.length && !other.length && (
//           <div className="questions-columns">
//             {questions.map((q, i) => (
//               <QuestionItem
//                 key={(q as any)._id ?? `${i + 1}`}
//                 question={q}
//                 index={i + 1}
//                 showOptions={showOptions}
//                 showSolution={showSolution}
//                 language={language}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Print Modal Component
// export function PrintExamModal({
//   isOpen,
//   onClose,
//   questions,
//   subject,
//   chapterGroup, // (kept to match your props)
//   chapter,
//   language,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   questions: Question[];
//   subject: string;
//   chapterGroup: string;
//   chapter: string;
//   language: "en" | "hi";
// }) {
//   const [config, setConfig] = useState<ExamConfig>({
//     instituteName: "ABC Institute",
//     studentName: "",
//     testName: `${chapter} - Test`,
//     date: new Date().toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     }),
//     duration: "3 Hours",
//   });

//   const [showOptions, setShowOptions] = useState(true);
//   const [showSolution, setShowSolution] = useState(false);
//   const previewRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     document.body.style.overflow = isOpen ? "hidden" : "unset";
//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [isOpen]);

//   const handlePrint = () => {
//     let printRoot = document.getElementById("print-root");
//     if (!printRoot) {
//       printRoot = document.createElement("div");
//       printRoot.id = "print-root";
//       document.body.appendChild(printRoot);
//     }

//     if (!previewRef.current) return;

//     printRoot.innerHTML = `<div class="print-watermark">coderoof</div>${previewRef.current.innerHTML}`;
//     printRoot.style.display = "block";

//     const style = document.createElement("style");
//     style.textContent = `
//       @media print {
//         @page { size: A4; margin: 6mm; }

//         /* allow printing background colors */
//         #print-root, #print-root * {
//           -webkit-print-color-adjust: exact !important;
//           print-color-adjust: exact !important;
//         }

//         body > *:not(#print-root) { display: none !important; }
//         #print-root { display: block !important; }

//         #print-root .print-container { padding: 0 !important; }

//         #print-root .questions-columns {
//           display: block !important;
//           column-count: 2 !important;
//           column-gap: 8px !important;
//           column-fill: balance !important;
//           -webkit-column-fill: balance !important;

//         }

//         /* light red bg for each question */
//         #print-root .print-question{
//           /* background: #ffecec !important; */
//           padding: 4px 6px !important;
//           border-radius: 4px !important;
//           margin-bottom: 6px !important;
//         }

//         /* keep question number and text on same line */
//         #print-root .question-row{
//           display: flex !important;
//           align-items: flex-start !important;
//           gap: 4px !important;
//         }
//         #print-root .question-number{
//           flex: 0 0 auto !important;
//           width: auto !important;
//           vertical-align: top !important;
//         }
//         #print-root .question-body{
//           flex: 1 1 auto !important;
//           min-width: 0 !important;
//           display: block !important;
//         }

//         /* force question text inline */
//         #print-root .question-text,
//         #print-root .question-text p{
//           display: inline !important;
//           margin: 0 !important;
//         }



//         /* image layout: rows of 3 */
//         #print-root .print-images-grid{
//           display: block !important;
//           margin: 2px 0 !important;
//         }
//         #print-root .print-images-row{
//           display: flex !important;
//           gap: 4px !important;
//           margin: 2px 0 !important;

//           /* keep a whole row together */
//           break-inside: avoid-column !important;
//           -webkit-column-break-inside: avoid !important;
//           page-break-inside: avoid !important;
//         }

//         /* IMPORTANT: allow individual image boxes to flow normally */
//         #print-root .print-image-container{
//           break-inside: auto !important;
//           -webkit-column-break-inside: auto !important;
//           page-break-inside: auto !important;
//           background: #fff !important;
//         }

// #print-root .keep-with-first-options{
//   display: inline-block !important;
//   width: 100% !important;

//   break-inside: avoid !important;
//   break-inside: avoid-column !important;
//   -webkit-column-break-inside: avoid !important;
//   page-break-inside: avoid !important;
// }

// #print-root .keep-with-first-options .options-row{
//   break-inside: avoid !important;
//   break-inside: avoid-column !important;
//   -webkit-column-break-inside: avoid !important;
//   page-break-inside: avoid !important;
// }

// /* ✅ Also keep the first options row together (2 options in one row) */
// #print-root .options-row{
//   break-inside: avoid !important;
//   break-inside: avoid-column !important;
//   -webkit-column-break-inside: avoid !important;
//   page-break-inside: avoid !important;
// }


//         #print-root .options-grid {
//           display: block !important;
//           margin-top: 4px !important;
//         }
//         #print-root .option-item {
//           display: inline-block !important;
//           width: 49% !important;
//           vertical-align: top !important;
//           margin: 0 0 6px 0 !important;

//           break-inside: avoid !important;
//           -webkit-column-break-inside: avoid !important;
//           page-break-inside: avoid !important;
//         }

//         #print-root .section-header {
//           break-inside: avoid !important;
//           -webkit-column-break-inside: avoid !important;
//           page-break-inside: avoid !important;
//         }
//       }
//     `;
//     document.head.appendChild(style);

//     const MJ = (window as any).MathJax;

//     const cleanup = () => {
//       printRoot!.style.display = "none";
//       style.remove();
//       window.removeEventListener("afterprint", cleanup);
//     };
//     window.addEventListener("afterprint", cleanup);

//     const doPrint = () => window.print();

//     if (MJ?.typesetPromise) {
//       MJ.typesetClear?.([printRoot]);
//       MJ.typesetPromise([printRoot]).then(doPrint).catch(doPrint);
//     } else {
//       doPrint();
//     }
//   };

//   if (!isOpen) return null;

//   const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

//   return (
//     <div className="fixed inset-0 z-50 overflow-hidden print-hidden">
//       <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
//       <div className="fixed inset-4 bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b bg-gray-50">
//           <h2 className="text-xl font-bold text-gray-900">Print Exam Paper</h2>
//           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         {/* Body */}
//         <div className="flex flex-1 overflow-hidden">
//           {/* Config Panel */}
//           <div className="w-72 border-r bg-gray-50 p-4 overflow-y-auto space-y-3">
//             <h3 className="font-semibold text-gray-900 mb-3">Configuration</h3>
//             {[
//               { label: "Institute Name", key: "instituteName" },
//               { label: "Student Name", key: "studentName", placeholder: "Optional" },
//               { label: "Test Name", key: "testName" },
//               { label: "Date", key: "date" },
//               { label: "Duration", key: "duration" },
//             ].map(({ label, key, placeholder }) => (
//               <div key={key}>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//                 <input
//                   type="text"
//                   value={config[key as keyof ExamConfig]}
//                   onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
//                   placeholder={placeholder}
//                   className="w-full px-3 py-2 border rounded-md text-sm"
//                 />
//               </div>
//             ))}

//             <div className="border-t pt-3 mt-3 space-y-2">
//               <label className="flex items-center gap-2 text-sm">
//                 <input
//                   type="checkbox"
//                   checked={showOptions}
//                   onChange={(e) => setShowOptions(e.target.checked)}
//                   className="h-4 w-4"
//                 />
//                 Show Options
//               </label>
//               <label className="flex items-center gap-2 text-sm">
//                 <input
//                   type="checkbox"
//                   checked={showSolution}
//                   onChange={(e) => setShowSolution(e.target.checked)}
//                   className="h-4 w-4"
//                 />
//                 Show Solutions
//               </label>
//             </div>

//             <div className="border-t pt-3 mt-3 text-sm text-gray-600">
//               <div>
//                 <strong>Questions:</strong> {questions.length}
//               </div>
//               <div>
//                 <strong>Total Marks:</strong> {totalMarks}
//               </div>
//             </div>
//           </div>

//           {/* Preview */}
//           <div className="flex-1 overflow-auto bg-gray-200 p-4">
//             <MathJaxTypesetter deps={[isOpen, showOptions, showSolution, config, language]}>
//               <div ref={previewRef} className="a4-preview mx-auto bg-white shadow-lg">
//                 <ExamSheet
//                   questions={questions}
//                   config={config}
//                   subject={subject}
//                   showOptions={showOptions}
//                   showSolution={showSolution}
//                   language={language}
//                 />
//               </div>
//             </MathJaxTypesetter>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-gray-700 bg-white border rounded-md hover:bg-gray-50"
//           >
//             Cancel
//           </button>

//           <button
//             onClick={handlePrint}
//             className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
//               />
//             </svg>
//             Print / Download PDF
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ExamSheet;



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

const chunk = <T,>(arr: T[], size: number) => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

interface ExamConfig {
  instituteName: string;
  studentName: string;
  testName: string;
  date: string;
  duration: string;
}

const PrintImageRow = ({ row }: { row: any[] }) => {
  return (
    <div className="print-images-row">
      {row.map((img, idx) => (
        <div
          key={img?.publicId ?? img?.url ?? idx}
          className="print-image-container"
          style={{
            width: "100px",
            height: "100px",
            minWidth: "100px",
            minHeight: "100px",
            maxWidth: "100px",
            maxHeight: "100px",
          }}
        >
          <img
            src={
              img.url ||
              `https://res.cloudinary.com/dvh5crcf9/image/upload/v${img.version}/${img.publicId}`
            }
            alt={img.alt || `Image ${idx + 1}`}
            className="print-image"
            style={{ objectFit: "contain", width: "100%", height: "100%" }}
          />
        </div>
      ))}
    </div>
  );
};

const PrintImageGallery = ({ images }: { images: any[] }) => {
  if (!images || images.length === 0) return null;
  const rows = chunk(images, 3);
  return (
    <div className="print-images-grid">
      {rows.map((row, rIdx) => (
        <PrintImageRow key={rIdx} row={row} />
      ))}
    </div>
  );
};

const QuestionItem = ({
  question,
  index,
  showOptions,
  showSolution,
  language,
}: {
  question: Question;
  index: number;
  showOptions: boolean;
  showSolution: boolean;
  language: "en" | "hi";
}) => {
  const preferred = language;
  const fallback = language === "en" ? "hi" : "en";
  const p =
    (question as any).prompt?.[preferred] ?? (question as any).prompt?.[fallback];

  const options = p?.options ?? [];

  // Question images split into rows of 3
  const qImageRows = chunk(p?.images || [], 3);
  const qFirstRow = qImageRows[0] ?? [];
  const qRestRows = qImageRows.slice(1);

  // Options split into rows of 2 (because you print 2 options per row)
  const optionRows = chunk(options, 2);
  const firstOptionRow = optionRows[0] ?? [];
  const restOptionRows = optionRows.slice(1);

  const renderOptionItem = (opt: any) => {
    const isCorrect =
      showSolution && question.correct?.identifiers?.includes(opt.identifier);

    // Option images in rows of 3
    const oImageRows = chunk(opt.images || [], 3);
    const oFirstRow = oImageRows[0] ?? [];
    const oRestRows = oImageRows.slice(1);

    return (
      <div
        key={opt.identifier}
        className={`option-item ${isCorrect ? "correct-answer" : ""}`}
      >
        {/* Keep option text + first option-image-row together */}
        <div className="keep-with-first-row">
          <div className="option-text-row">
            <span className="option-label">({opt.identifier})</span>
            <span
              className="print-math-content"
              dangerouslySetInnerHTML={{ __html: formatMath(opt.content) }}
            />
          </div>

          {oFirstRow.length > 0 && (
            <div className="option-images-wrapper">
              <div className="print-images-grid">
                <PrintImageRow row={oFirstRow} />
              </div>
            </div>
          )}
        </div>

        {/* Remaining option image rows */}
        {oRestRows.length > 0 && (
          <div className="option-images-wrapper">
            <div className="print-images-grid">
              {oRestRows.map((row: any[], rIdx: number) => (
                <PrintImageRow key={rIdx} row={row} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="print-question">
      <div className="question-row">
        <span className="question-number">{index}.</span>

        <div className="question-body">
          {/* CASE 1: Question has images → keep text + FIRST image row together */}
          {qFirstRow.length > 0 ? (
            <>
              <div className="keep-with-first-row">
                <span
                  className="print-math-content question-text"
                  dangerouslySetInnerHTML={{ __html: formatMath(p?.content || "") }}
                />
                <div className="print-images-grid">
                  <PrintImageRow row={qFirstRow} />
                </div>
              </div>

              {/* Remaining image rows can flow */}
              {qRestRows.length > 0 && (
                <div className="print-images-grid">
                  {qRestRows.map((row, rIdx) => (
                    <PrintImageRow key={rIdx} row={row} />
                  ))}
                </div>
              )}

              {/* Options (all rows) */}
              {showOptions && options.length > 0 && (
                <div className="options-grid">
                  {optionRows.map((row, rIdx) => (
                    <div key={rIdx} className="options-row">
                      {row.map(renderOptionItem)}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* CASE 2: No question images → keep text + FIRST OPTIONS ROW together */
            <>
              <div className="keep-with-first-row keep-with-first-options">
                <span
                  className="print-math-content question-text"
                  dangerouslySetInnerHTML={{ __html: formatMath(p?.content || "") }}
                />

                {showOptions && firstOptionRow.length > 0 && (
                  <div className="options-grid">
                    <div className="options-row">
                      {firstOptionRow.map(renderOptionItem)}
                    </div>
                  </div>
                )}
              </div>

              {/* Remaining option rows flow after */}
              {showOptions && restOptionRows.length > 0 && (
                <div className="options-grid">
                  {restOptionRows.map((row, rIdx) => (
                    <div key={rIdx} className="options-row">
                      {row.map(renderOptionItem)}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Explanation images (optional) */}
          {showSolution &&
            p?.explanationImages &&
            p.explanationImages.length > 0 && (
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
const Section = ({
  title,
  questions,
  startIndex,
  showOptions,
  showSolution,
  language,
}: {
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
          <li>
            This section contains <strong>{questions.length}</strong> questions.
          </li>
          <li>
            Each question has <strong>FOUR</strong> options (A), (B), (C) and (D).{" "}
            <strong>ONLY ONE</strong> is correct.
          </li>
          <li>
            Marking scheme:
            <div className="marking-scheme">
              <div>
                <em>Full Marks</em>: <strong>+{marks}</strong>
              </div>
              <div>
                <em>Zero Marks</em>: <strong>0</strong>
              </div>
              {negMarks > 0 && (
                <div>
                  <em>Negative Marks</em>: <strong>-{negMarks}</strong>
                </div>
              )}
            </div>
          </li>
        </ul>
      </div>

      <div className="questions-columns">
        {questions.map((q, i) => (
          <QuestionItem
            key={(q as any)._id ?? `${startIndex + i}`}
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
const ExamSheet = ({
  questions,
  config,
  subject,
  showOptions,
  showSolution,
  language,
}: {
  questions: Question[];
  config: ExamConfig;
  subject: string;
  showOptions: boolean;
  showSolution: boolean;
  language: "en" | "hi";
}) => {
  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  const mcq = questions.filter((q) => ["MCQ", "MSQ", "TRUE_FALSE"].includes(q.kind));
  const numerical = questions.filter((q) => ["INTEGER", "FILL_BLANK"].includes(q.kind));
  const other = questions.filter(
    (q) =>
      !["MCQ", "MSQ", "TRUE_FALSE", "INTEGER", "FILL_BLANK"].includes(q.kind)
  );

  let idx = 1;

  return (
    <div className="print-container">
      <div className="exam-header">
        <h1 className="institute-name">{config.instituteName}</h1>
        <div className="exam-meta">
          <div className="meta-left">
            <div>
              <strong>Subject:</strong> {subject}
            </div>
            <div>
              <strong>Total Marks:</strong> {totalMarks}
            </div>
          </div>
          <div className="meta-center">
            <span className="test-name">{config.testName}</span>
          </div>
          <div className="meta-right">
            <div>
              <strong>Date:</strong> {config.date}
            </div>
            <div>
              <strong>Hours:</strong> {config.duration}
            </div>
          </div>
        </div>
        {config.studentName && (
          <div className="student-name">
            <strong>Student Name:</strong> {config.studentName}
          </div>
        )}
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

        {(idx += mcq.length) && numerical.length > 0 && (
          <Section
            title="Section B (Numerical)"
            questions={numerical}
            startIndex={idx}
            showOptions={showOptions}
            showSolution={showSolution}
            language={language}
          />
        )}

        {(idx += numerical.length) && other.length > 0 && (
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
                key={(q as any)._id ?? `${i + 1}`}
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
export function PrintExamModal({
  isOpen,
  onClose,
  questions,
  subject,
  chapterGroup, // (kept to match your props)
  chapter,
  language,
}: {
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
    date: new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    duration: "3 Hours",
  });

  const [showOptions, setShowOptions] = useState(true);
  const [showSolution, setShowSolution] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Lock scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // ✅ Preview-only CSS: show images 3-per-row in the SCREEN preview (does not affect print)
  useEffect(() => {
    if (!isOpen) return;

    const STYLE_ID = "preview-images-3-per-row";
    if (document.getElementById(STYLE_ID)) return;

    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = `
      @media screen {
        .a4-preview .print-images-grid {
          display: block;
          margin: 2px 0;
        }
        .a4-preview .print-images-row {
          display: flex;
          gap: 4px;
          margin: 2px 0;
        }
        .a4-preview .print-image-container {
          flex: 0 0 100px;
        }
      }
    `;
    document.head.appendChild(s);

    return () => {
      s.remove();
    };
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

        /* allow printing background colors */
        #print-root, #print-root * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        body > *:not(#print-root) { display: none !important; }
        #print-root { display: block !important; }

        #print-root .print-container { padding: 0 !important; }

        #print-root .questions-columns {
          display: block !important;
          column-count: 2 !important;
          column-gap: 8px !important;
          column-fill: balance !important;
          -webkit-column-fill: balance !important;
        }

        /* light red bg for each question */
        #print-root .print-question{
          /* background: #ffecec !important; */
          padding: 4px 6px !important;
          border-radius: 4px !important;
          margin-bottom: 6px !important;
        }

        /* keep question number and text on same line */
        #print-root .question-row{
          display: flex !important;
          align-items: flex-start !important;
          gap: 4px !important;
        }
        #print-root .question-number{
          flex: 0 0 auto !important;
          width: auto !important;
          vertical-align: top !important;
        }
        #print-root .question-body{
          flex: 1 1 auto !important;
          min-width: 0 !important;
          display: block !important;
        }

        /* force question text inline */
        #print-root .question-text,
        #print-root .question-text p{
          display: inline !important;
          margin: 0 !important;
        }

        /* image layout: rows of 3 */
        #print-root .print-images-grid{
          display: block !important;
          margin: 2px 0 !important;
        }
        #print-root .print-images-row{
          display: flex !important;
          gap: 4px !important;
          margin: 2px 0 !important;

          /* keep a whole row together */
          break-inside: avoid-column !important;
          -webkit-column-break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        /* IMPORTANT: allow individual image boxes to flow normally */
        #print-root .print-image-container{
          break-inside: auto !important;
          -webkit-column-break-inside: auto !important;
          page-break-inside: auto !important;
          background: #fff !important;
        }

        /* ✅ NO-IMAGE questions only: keep question text + first options row together (columns + pages) */
        #print-root .keep-with-first-options{
          display: table !important;
          width: 100% !important;
          table-layout: fixed !important;

          break-inside: avoid !important;
          break-inside: avoid-column !important;
          -webkit-column-break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        /* ✅ prevent break right before the first options row (inside that wrapper) */
        #print-root .keep-with-first-options .options-grid{
          break-before: avoid !important;
          page-break-before: avoid !important;

          break-inside: avoid !important;
          break-inside: avoid-column !important;
          -webkit-column-break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        #print-root .keep-with-first-options .options-row{
          break-inside: avoid !important;
          break-inside: avoid-column !important;
          -webkit-column-break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        /* keep each options row together */
        #print-root .options-row{
          break-inside: avoid !important;
          break-inside: avoid-column !important;
          -webkit-column-break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        #print-root .options-grid {
          display: block !important;
          margin-top: 4px !important;
        }
        #print-root .option-item {
          display: inline-block !important;
          width: 49% !important;
          vertical-align: top !important;
          margin: 0 0 6px 0 !important;

          break-inside: avoid !important;
          -webkit-column-break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

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
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
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
                <input
                  type="checkbox"
                  checked={showOptions}
                  onChange={(e) => setShowOptions(e.target.checked)}
                  className="h-4 w-4"
                />
                Show Options
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showSolution}
                  onChange={(e) => setShowSolution(e.target.checked)}
                  className="h-4 w-4"
                />
                Show Solutions
              </label>
            </div>

            <div className="border-t pt-3 mt-3 text-sm text-gray-600">
              <div>
                <strong>Questions:</strong> {questions.length}
              </div>
              <div>
                <strong>Total Marks:</strong> {totalMarks}
              </div>
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
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print / Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExamSheet;
