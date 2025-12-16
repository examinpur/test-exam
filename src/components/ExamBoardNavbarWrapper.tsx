import { getAllBoards, getAllExams, getAllSubjects, getAllChapterGroups, getAllChapters } from '@/lib/api';
import ExamBoardNavbar from './ExamBoardNavbar';
import { Board, Exam, Subject, ChapterGroup, Chapter } from '@/types';

interface BoardWithExams extends Board {
  exams: ExamWithSubjects[];
}

interface ExamWithSubjects extends Exam {
  subjects: SubjectWithChapterGroups[];
}

interface SubjectWithChapterGroups extends Subject {
  chapterGroups: ChapterGroupWithChapters[];
}

interface ChapterGroupWithChapters extends ChapterGroup {
  chapters: Chapter[];
}

export const revalidate = 60;

async function getNavbarData(): Promise<BoardWithExams[]> {
  try {
    const [boards, exams, subjects, chapterGroups, chapters] = await Promise.all([
      getAllBoards(),
      getAllExams(),
      getAllSubjects(),
      getAllChapterGroups(),
      getAllChapters(),
    ]);


    const boardsWithExams: BoardWithExams[] = boards.map((board: Board) => {
      const boardExams = exams
        .filter((exam: Exam) => exam.boardId === board._id)
        .map((exam: Exam): ExamWithSubjects => {
          const examSubjects = subjects
            .filter((subject: Subject) => subject.examId === exam._id)
            .map((subject: Subject): SubjectWithChapterGroups => {
              const subjectChapterGroups = chapterGroups
                .filter((cg: ChapterGroup) => cg.subjectId === subject._id)
                .map((cg: ChapterGroup): ChapterGroupWithChapters => ({
                  ...cg,
                  chapters: chapters
                    .filter((ch: Chapter) => ch.chapterGroupId === cg._id)
                    .sort((a: Chapter, b: Chapter) => a.order - b.order),
                }))
                .sort((a: ChapterGroupWithChapters, b: ChapterGroupWithChapters) => a.order - b.order);

              return {
                ...subject,
                chapterGroups: subjectChapterGroups,
              };
            })
            .sort((a: SubjectWithChapterGroups, b: SubjectWithChapterGroups) => a.order - b.order);

          return {
            ...exam,
            subjects: examSubjects,
          };
        })
        .sort((a: ExamWithSubjects, b: ExamWithSubjects) => a.order - b.order);

      return {
        ...board,
        exams: boardExams,
      };
    });

    boardsWithExams.sort((a, b) => a.order - b.order);

    return boardsWithExams;
  } catch (error) {
    console.error('Error fetching navigation data:', error);
    return [];
  }
}

export default async function ExamBoardNavbarWrapper() {
  const boardsData = await getNavbarData();
  
  if (boardsData.length === 0) {
    return null;
  }

  return <ExamBoardNavbar boardsData={boardsData} />;
}

