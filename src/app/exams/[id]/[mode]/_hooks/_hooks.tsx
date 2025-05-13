import { useCallback, useEffect, useState } from "react";
import type {
  Exam,
  ExamAttempt,
  ExamHistory,
  ExamSummary,
  QuestionStats,
} from "~/types";

// Utility functions for localStorage operations
const storage = {
  getExams: () => {
    const saved = localStorage.getItem("exams");
    return saved ? (JSON.parse(saved) as Exam[]) : [];
  },
  saveExams: (exams: Exam[]) => {
    localStorage.setItem("exams", JSON.stringify(exams));
  },
  getAnswers: (examId: string) => {
    const saved = localStorage.getItem(`exam-answers-${examId}`);
    return saved
      ? (JSON.parse(saved) as Record<string, string | string[]>)
      : {};
  },
  saveAnswers: (examId: string, answers: Record<string, string | string[]>) => {
    localStorage.setItem(`exam-answers-${examId}`, JSON.stringify(answers));
  },
  getHistory: (examId: string) => {
    const saved = localStorage.getItem(`exam-history-${examId}`);
    return saved ? (JSON.parse(saved) as ExamHistory) : null;
  },
  saveHistory: (examId: string, history: ExamHistory) => {
    localStorage.setItem(`exam-history-${examId}`, JSON.stringify(history));
  },
  saveSummary: (summary: ExamSummary) => {
    const saved = localStorage.getItem("examSummaries");
    const summaries = saved ? (JSON.parse(saved) as ExamSummary[]) : [];
    summaries.push(summary);
    localStorage.setItem("examSummaries", JSON.stringify(summaries));
  },
};

// Hook for managing exam state
function useExamState(examId: string, mode: "take" | "review") {
  const [exam, setExam] = useState<Exam | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [examStartTime, setExamStartTime] = useState<number>(0);

  useEffect(() => {
    const exams = storage.getExams();
    const foundExam = exams.find((e) => e.id === examId);
    if (foundExam) {
      setExam(foundExam);
      if (mode === "take") {
        setTimeLeft(foundExam.timeLimit * 60);
        setExamStartTime(Date.now());
      }
    }
  }, [examId, mode]);

  return { exam, setExam, timeLeft, setTimeLeft, examStartTime };
}

// Hook for managing answers
function useAnswers(examId: string) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string | string[]>
  >({});
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(
    new Set(),
  );
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    try {
      const savedAnswers = storage.getAnswers(examId);
      if (savedAnswers) {
        setAnswers(savedAnswers);
        setSelectedAnswers(savedAnswers);
        setAnsweredQuestions(new Set(Object.keys(savedAnswers)));
      }
    } catch (error: unknown) {
      console.error(
        "Error loading answers:",
        error instanceof Error ? error.message : String(error),
      );
    }
  }, [examId]);

  const updateAnswer = useCallback(
    (questionId: string, value: string | string[]) => {
      setAnswers((prev: Record<string, string | string[]>) => {
        const newAnswers = { ...prev, [questionId]: value };
        try {
          storage.saveAnswers(examId, newAnswers);
        } catch (error: unknown) {
          console.error(
            "Error saving answers:",
            error instanceof Error ? error.message : String(error),
          );
        }
        return newAnswers;
      });

      setSelectedAnswers((prev: Record<string, string | string[]>) => ({
        ...prev,
        [questionId]: value,
      }));
      setAnsweredQuestions(
        (prev: Set<string>) => new Set([...prev, questionId]),
      );
    },
    [examId],
  );

  return {
    answers,
    setAnswers,
    selectedAnswers,
    setSelectedAnswers,
    completedQuestions,
    setCompletedQuestions,
    answeredQuestions,
    updateAnswer,
  };
}

// Hook for managing question timing
function useQuestionTiming(
  exam: Exam | null,
  mode: "take" | "review",
  currentQuestionIndex: number,
) {
  const [questionStartTimes, setQuestionStartTimes] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    if (!exam || mode !== "take") return;
    const currentQuestionId = exam.questions[currentQuestionIndex]?.id;
    if (currentQuestionId) {
      setQuestionStartTimes((prev) => ({
        ...prev,
        [currentQuestionId]: Date.now(),
      }));
    }
  }, [exam, mode, currentQuestionIndex]);

  return { questionStartTimes };
}

// Utility function for option styling
export function getOptionBackgroundColor(
  showFeedback: boolean,
  isCorrect: boolean,
): string {
  if (!showFeedback) return "";
  return isCorrect ? "bg-green-100" : "bg-orange-100";
}

// Main hook that combines all the functionality
export function useExam({
  examId,
  mode,
  currentQuestionIndex,
  setCurrentQuestionIndex,
}: {
  examId: string;
  mode: "take" | "review";
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
}) {
  const { exam, setExam, timeLeft, setTimeLeft, examStartTime } = useExamState(
    examId,
    mode,
  );
  const {
    answers,
    setAnswers,
    selectedAnswers,
    setSelectedAnswers,
    completedQuestions,
    setCompletedQuestions,
    answeredQuestions,
    updateAnswer,
  } = useAnswers(examId);
  const { questionStartTimes } = useQuestionTiming(
    exam,
    mode,
    currentQuestionIndex,
  );
  const [examHistory, setExamHistory] = useState<ExamHistory | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load exam history
  useEffect(() => {
    const history = storage.getHistory(examId);
    if (history) setExamHistory(history);
  }, [examId]);

  const isAnswerCorrect = useCallback(
    (questionId: string, currentValue?: string | string[]) => {
      if (!exam) return false;
      const question = exam.questions.find((q) => q.id === questionId);
      if (!question) return false;

      const userAnswer = currentValue ?? answers[questionId];
      if (!userAnswer) return false;

      if (question.type === "multiple-choice") {
        return userAnswer === question.correctAnswer;
      }

      if (question.type === "checkbox") {
        const correctAnswers = question.correctAnswers ?? [];
        const userAnswers = userAnswer as string[];
        return (
          correctAnswers.length === userAnswers.length &&
          correctAnswers.every((answer) => userAnswers.includes(answer))
        );
      }

      if (question.type === "text") {
        return (
          userAnswer.toString().toLowerCase().trim() ===
          question.correctAnswer?.toLowerCase().trim()
        );
      }

      return false;
    },
    [exam, answers],
  );

  const handleAnswerChange = useCallback(
    (questionId: string, value: string | string[]) => {
      if (!exam) return;
      const question = exam.questions.find((q) => q.id === questionId);
      if (!question) return;

      if (questionId !== exam.questions[currentQuestionIndex]?.id) return;

      updateAnswer(questionId, value);

      if (mode === "review" && isAnswerCorrect(questionId, value)) {
        setCompletedQuestions((prev) => new Set([...prev, questionId]));
      }
    },
    [
      exam,
      mode,
      currentQuestionIndex,
      updateAnswer,
      isAnswerCorrect,
      setCompletedQuestions,
    ],
  );

  const calculateQuestionStats = useCallback((): QuestionStats[] => {
    if (!exam) return [];

    return exam.questions.map((question) => {
      const startTime = questionStartTimes[question.id];
      const timeSpent = startTime ? (Date.now() - startTime) / 1000 : 0;
      const isCorrect = isAnswerCorrect(question.id);

      return {
        questionId: question.id,
        timeSpent,
        isCorrect,
        attempts: 1,
        lastAttempted: new Date().toISOString(),
      };
    });
  }, [exam, isAnswerCorrect, questionStartTimes]);

  const handleSubmit = useCallback(() => {
    if (mode === "take" && exam) {
      const questionStats = calculateQuestionStats();
      const correctAnswers = questionStats.filter(
        (stat) => stat.isCorrect,
      ).length;
      const totalQuestions = exam.questions.length;
      const score = (correctAnswers / totalQuestions) * 100;
      const totalTime = (Date.now() - examStartTime) / 1000;

      const newAttempt: ExamAttempt = {
        id: crypto.randomUUID(),
        examId: exam.id,
        startTime: new Date(examStartTime).toISOString(),
        endTime: new Date().toISOString(),
        totalTime,
        questionStats,
        score,
        totalQuestions,
        correctAnswers,
        incorrectAnswers: totalQuestions - correctAnswers,
      };

      const updatedHistory: ExamHistory = {
        examId: exam.id,
        attempts: [...(examHistory?.attempts ?? []), newAttempt],
        averageScore: examHistory
          ? (examHistory.averageScore * examHistory.totalAttempts + score) /
            (examHistory.totalAttempts + 1)
          : score,
        bestScore: examHistory ? Math.max(examHistory.bestScore, score) : score,
        totalAttempts: (examHistory?.totalAttempts ?? 0) + 1,
        averageTimePerQuestion: examHistory
          ? (examHistory.averageTimePerQuestion * examHistory.totalAttempts +
              totalTime / totalQuestions) /
            (examHistory.totalAttempts + 1)
          : totalTime / totalQuestions,
        lastAttempted: new Date().toISOString(),
      };

      setExamHistory(updatedHistory);
      storage.saveHistory(examId, updatedHistory);

      const examSummary: ExamSummary = {
        id: newAttempt.id,
        examId: exam.id,
        examTitle: exam.title,
        date: new Date().toLocaleDateString(),
        score,
        totalQuestions,
        timeSpent: Math.round(totalTime / 60),
        timeLimit: exam.timeLimit,
        correctAnswers,
        incorrectAnswers: totalQuestions - correctAnswers,
      };

      storage.saveSummary(examSummary);
      setIsSubmitted(true);
    }
  }, [mode, exam, examHistory, examStartTime, calculateQuestionStats, examId]);

  // Timer effect
  useEffect(() => {
    if (mode === "take" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [mode, timeLeft, handleSubmit, setTimeLeft]);

  const resetQuestion = useCallback(
    (exam: Exam) => () => {
      const currentQuestionId = exam.questions[currentQuestionIndex]?.id;
      if (!currentQuestionId) return;

      setAnswers((prev) => {
        const newAnswers = { ...prev };
        delete newAnswers[currentQuestionId];
        storage.saveAnswers(examId, newAnswers);
        return newAnswers;
      });

      setCompletedQuestions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(currentQuestionId);
        return newSet;
      });

      setSelectedAnswers((prev) => {
        const newAnswers = { ...prev };
        delete newAnswers[currentQuestionId];
        return newAnswers;
      });

      const exams = storage.getExams();
      const updatedExams = exams.map((e) => {
        if (e.id === examId) {
          const updatedQuestions = e.questions.map((q) => {
            if (q.id === currentQuestionId) {
              return {
                ...q,
                completed: false,
                incorrectAnswers: [],
              };
            }
            return q;
          });
          return {
            ...e,
            questions: updatedQuestions,
            completed: updatedQuestions.every((q) => q.completed),
          };
        }
        return e;
      });
      storage.saveExams(updatedExams);

      setExam((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: prev.questions.map((q) => {
            if (q.id === currentQuestionId) {
              return {
                ...q,
                completed: false,
                incorrectAnswers: [],
              };
            }
            return q;
          }),
          completed: prev.questions.every((q) => q.completed),
        };
      });

      setCurrentQuestionIndex(currentQuestionIndex);
    },
    [currentQuestionIndex, examId, setCurrentQuestionIndex],
  );

  return {
    exam,
    timeLeft,
    examStartTime,
    questionStartTimes,
    completedQuestions,
    answeredQuestions,
    selectedAnswers,
    answers,
    examHistory,
    handleAnswerChange,
    isAnswerCorrect,
    handleSubmit,
    isSubmitted,
    resetQuestion,
    setExam,
  };
}
