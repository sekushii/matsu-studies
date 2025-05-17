// Question Types
export type QuestionType = "multiple-choice" | "checkbox" | "text";

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  image?: string | null;
  options: Array<{
    text: string;
    image?: string | null;
  }>;
  correctAnswer?: string;
  correctAnswers?: string[];
  completed?: boolean;
  incorrectAnswers?: string[];
  notes?: string;
  tips?: string[];
  subject?: string;
  topics?: string[];
}

// Exam Types
export interface Exam {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  icon?: string;
  folderId?: string;
  questions: Question[];
  completed?: boolean;
  subject?: string;
  topics?: string[];
}

// Folder Types
export interface Folder {
  id: string;
  name: string;
  iconUrl?: string; // Base64 image data
  exams: string[]; // Array of exam IDs
  subject?: string;
}

// Exam History Types
export interface QuestionStats {
  questionId: string;
  timeSpent: number;
  isCorrect: boolean;
  attempts: number;
  lastAttempted: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  startTime: string;
  endTime: string;
  totalTime: number;
  questionStats: QuestionStats[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

export interface ExamHistory {
  examId: string;
  attempts: ExamAttempt[];
  averageScore: number;
  bestScore: number;
  totalAttempts: number;
  averageTimePerQuestion: number;
  lastAttempted: string;
}

export interface ExamSummary {
  id: string;
  examId: string;
  examTitle: string;
  date: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  timeLimit: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

// Component Props Types
export interface SubjectSelectorProps {
  selectedSubject: string;
  availableSubjects: string[];
  onSubjectSelect: (subject: string) => void;
  onSubjectRemove: (subject: string) => void;
  onNewSubject: (subject: string) => void;
  subjectLimit: number;
}

// Utility Types
export type SortField = "date" | "examTitle" | "score" | "timeSpent";
export type SortOrder = "asc" | "desc";
