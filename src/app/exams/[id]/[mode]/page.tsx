"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Textarea } from "~/components/ui/textarea";
import { ArrowLeft, ArrowRight, Clock, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type QuestionType = "multiple-choice" | "checkbox" | "text";

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  questionImage?: string;
  options: Array<{
    text: string;
    image?: string;
  }>;
  correctAnswer?: string;
  correctAnswers?: string[];
  completed?: boolean;
  incorrectAnswers: string[];
}

interface Exam {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  icon?: string;
  folderId?: string;
  questions: Question[];
  completed?: boolean;
}

export default function ExamPage() {
  const params = useParams();
  const examId = params.id as string;
  const mode = params.mode as "review" | "take";

  const [exam, setExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(
    new Set(),
  );
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(
    new Set(),
  );
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string | string[]>
  >({});

  const handleSubmit = useCallback(() => {
    if (mode === "take") {
      setIsSubmitted(true);
    }
  }, [mode]);

  useEffect(() => {
    // Load exam from localStorage
    const savedExams = localStorage.getItem("exams");
    if (savedExams) {
      const exams = JSON.parse(savedExams) as Exam[];
      const foundExam = exams.find((e) => e.id === examId);
      if (foundExam) {
        setExam(foundExam);
        if (mode === "take") {
          setTimeLeft(foundExam.timeLimit * 60);
        }
        // Load completed questions
        const completed = new Set(
          foundExam.questions.filter((q) => q.completed).map((q) => q.id),
        );
        setCompletedQuestions(completed);

        // Load answered questions from localStorage
        const savedAnswers = localStorage.getItem(`exam-answers-${examId}`);
        if (savedAnswers) {
          try {
            const parsedAnswers = JSON.parse(savedAnswers) as Record<
              string,
              string | string[]
            >;
            setAnswers(parsedAnswers);
            const answered = new Set(Object.keys(parsedAnswers));
            setAnsweredQuestions(answered);

            // Initialize selected answers
            setSelectedAnswers(parsedAnswers);
          } catch (error) {
            console.error("Error parsing saved answers:", error);
          }
        }
      }
    }
  }, [examId, mode]);

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
  }, [mode, timeLeft, handleSubmit]);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    const question = exam?.questions.find((q) => q.id === questionId);
    if (!question || !exam) return;

    // Ensure we're only updating the current question's answer
    if (questionId !== exam.questions[currentQuestionIndex]?.id) return;

    setAnswers((prev) => {
      const newAnswers = { ...prev, [questionId]: value };
      localStorage.setItem(
        `exam-answers-${examId}`,
        JSON.stringify(newAnswers),
      );
      return newAnswers;
    });

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    // In review mode, check if the answer is correct
    if (mode === "review") {
      let isCorrect = false;
      if (question.type === "multiple-choice") {
        isCorrect = value === question.correctAnswer;
      } else if (question.type === "checkbox") {
        const correctAnswers = question.correctAnswers ?? [];
        const userAnswers = value as string[];
        isCorrect =
          correctAnswers.length === userAnswers.length &&
          correctAnswers.every((answer) => userAnswers.includes(answer));
      } else if (question.type === "text") {
        isCorrect =
          value.toString().toLowerCase().trim() ===
          question.correctAnswer?.toLowerCase().trim();
      }

      if (!isCorrect) {
        // Add to incorrect answers if not already present
        setExam((prev) => {
          if (!prev) return prev;
          const updatedQuestions = prev.questions.map((q) => {
            if (q.id === questionId) {
              const incorrectAnswers = q.incorrectAnswers ?? [];
              const answerToAdd = Array.isArray(value) ? value[0] : value;
              if (answerToAdd && !incorrectAnswers.includes(answerToAdd)) {
                return {
                  ...q,
                  incorrectAnswers: [...incorrectAnswers, answerToAdd],
                };
              }
            }
            return q;
          });
          const updatedExam = { ...prev, questions: updatedQuestions };
          // Save to localStorage
          const savedExams = localStorage.getItem("exams");
          if (savedExams) {
            const exams = JSON.parse(savedExams) as Exam[];
            const updatedExams = exams.map((e) =>
              e.id === examId ? updatedExam : e,
            );
            localStorage.setItem("exams", JSON.stringify(updatedExams));
          }
          return updatedExam;
        });
      } else {
        markQuestionAsCompleted(questionId);
      }
    }
  };

  // Add effect to clear selected answer when changing questions
  useEffect(() => {
    if (!exam) return;
    const currentQuestionId = exam.questions[currentQuestionIndex]?.id;
    if (currentQuestionId) {
      setSelectedAnswers((prev) => {
        const newSelected = { ...prev };
        // Only keep the current question's selection
        Object.keys(newSelected).forEach((key) => {
          if (key !== currentQuestionId) {
            delete newSelected[key];
          }
        });
        return newSelected;
      });
    }
  }, [currentQuestionIndex, exam]);

  const markQuestionAsCompleted = (questionId: string) => {
    setCompletedQuestions((prev) => {
      const updated = new Set(prev);
      updated.add(questionId);
      return updated;
    });

    // Update exam in localStorage
    const savedExams = localStorage.getItem("exams");
    if (savedExams) {
      const exams = JSON.parse(savedExams) as Exam[];
      const updatedExams = exams.map((e) => {
        if (e.id === examId) {
          const updatedQuestions = e.questions.map((q) =>
            q.id === questionId ? { ...q, completed: true } : q,
          );
          const allCompleted = updatedQuestions.every((q) => q.completed);
          return {
            ...e,
            questions: updatedQuestions,
            completed: allCompleted,
          };
        }
        return e;
      });
      localStorage.setItem("exams", JSON.stringify(updatedExams));
    }
  };

  if (!exam) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Exam was not found</h1>
          <Link href="/">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Question was not found</h1>
          <Link href="/">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const isAnswerCorrect = (questionId: string) => {
    const question = exam.questions.find((q) => q.id === questionId);
    if (!question) return false;

    const userAnswer = answers[questionId];
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
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{exam.title}</h1>
          <p className="text-muted-foreground">{exam.description}</p>
        </div>
        <Link href="/">
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {mode === "take" && !isSubmitted && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span className="text-lg font-medium">
              Time Left: {formatTime(timeLeft)}
            </span>
          </div>
          <Button onClick={handleSubmit}>Submit Exam</Button>
        </div>
      )}

      {exam?.questions?.[currentQuestionIndex] && (
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>
                Question {currentQuestionIndex + 1} of {exam.questions.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                {exam.questions[currentQuestionIndex]?.question}
              </p>

              {exam.questions[currentQuestionIndex]?.questionImage && (
                <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-md">
                  <Image
                    src={
                      exam.questions[currentQuestionIndex]?.questionImage ?? ""
                    }
                    alt="Question"
                    fill
                    className="object-contain"
                  />
                </div>
              )}

              {exam.questions[currentQuestionIndex]?.type ===
                "multiple-choice" && (
                <RadioGroup
                  value={
                    (answers[
                      exam.questions[currentQuestionIndex]?.id ?? ""
                    ] as string) ?? ""
                  }
                  onValueChange={(value) =>
                    handleAnswerChange(
                      exam.questions[currentQuestionIndex]?.id ?? "",
                      value,
                    )
                  }
                  disabled={isSubmitted}
                  className="space-y-2"
                >
                  {exam.questions[currentQuestionIndex]?.options.map(
                    (option, optionIndex) => {
                      const isCorrect =
                        option.text ===
                        exam.questions[currentQuestionIndex]?.correctAnswer;
                      const isSelected =
                        option.text ===
                        answers[exam.questions[currentQuestionIndex]?.id ?? ""];
                      const isIncorrect = exam.questions[
                        currentQuestionIndex
                      ]?.incorrectAnswers?.includes(option.text);
                      const showFeedback =
                        mode === "review" && (isSelected || isIncorrect);

                      let backgroundColor = "";
                      if (showFeedback) {
                        if (isCorrect) backgroundColor = "bg-green-100";
                        else if (isIncorrect) backgroundColor = "bg-orange-100";
                      }

                      return (
                        <div
                          key={`${exam.questions[currentQuestionIndex]?.id ?? ""}-option-${optionIndex}`}
                          className={`flex items-center space-x-4 rounded-md p-3 ${backgroundColor}`}
                        >
                          <RadioGroupItem
                            value={option.text}
                            id={`${exam.questions[currentQuestionIndex]?.id ?? ""}-option-${optionIndex}`}
                            className={`${
                              showFeedback && isCorrect
                                ? "border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                                : showFeedback
                                  ? "border-orange-500"
                                  : ""
                            }`}
                          />
                          <div className="flex items-center gap-4">
                            {option.image && (
                              <div className="relative h-16 w-16 overflow-hidden rounded-md">
                                <Image
                                  src={option.image}
                                  alt={option.text}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <Label
                              htmlFor={`${exam.questions[currentQuestionIndex]?.id ?? ""}-option-${optionIndex}`}
                              className="text-base"
                            >
                              {option.text}
                            </Label>
                          </div>
                        </div>
                      );
                    },
                  )}
                </RadioGroup>
              )}

              {exam.questions[currentQuestionIndex]?.type === "checkbox" && (
                <div className="space-y-2">
                  {exam.questions[currentQuestionIndex]?.options.map(
                    (option, optionIndex) => {
                      const isCorrect = exam.questions[
                        currentQuestionIndex
                      ]?.correctAnswers?.includes(option.text);
                      const isSelected = (
                        (answers[
                          exam.questions[currentQuestionIndex]?.id ?? ""
                        ] as string[]) ?? []
                      )?.includes(option.text);
                      const isIncorrect = exam.questions[
                        currentQuestionIndex
                      ]?.incorrectAnswers?.includes(option.text);
                      const showFeedback =
                        mode === "review" && (isSelected || isIncorrect);

                      let backgroundColor = "";
                      if (showFeedback) {
                        if (isCorrect) backgroundColor = "bg-green-100";
                        else if (isIncorrect) backgroundColor = "bg-orange-100";
                      }

                      return (
                        <div
                          key={`${exam.questions[currentQuestionIndex]?.id ?? ""}-option-${optionIndex}`}
                          className={`flex items-center space-x-4 rounded-md p-3 ${backgroundColor}`}
                        >
                          <Checkbox
                            id={`${exam.questions[currentQuestionIndex]?.id ?? ""}-option-${optionIndex}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const currentAnswers =
                                (answers[
                                  exam.questions[currentQuestionIndex]?.id ?? ""
                                ] as string[]) ?? [];
                              const newAnswers = checked
                                ? [...currentAnswers, option.text]
                                : currentAnswers.filter(
                                    (a) => a !== option.text,
                                  );
                              handleAnswerChange(
                                exam.questions[currentQuestionIndex]?.id ?? "",
                                newAnswers,
                              );
                            }}
                            disabled={isSubmitted}
                            className={`${
                              showFeedback && isCorrect
                                ? "border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                                : showFeedback
                                  ? "border-orange-500"
                                  : ""
                            }`}
                          />
                          <div className="flex items-center gap-4">
                            {option.image && (
                              <div className="relative h-16 w-16 overflow-hidden rounded-md">
                                <Image
                                  src={option.image}
                                  alt={option.text}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <Label
                              htmlFor={`${exam.questions[currentQuestionIndex]?.id ?? ""}-option-${optionIndex}`}
                              className="text-base"
                            >
                              {option.text}
                            </Label>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}

              {exam.questions[currentQuestionIndex]?.type === "text" && (
                <div className="space-y-2">
                  <Textarea
                    value={
                      answers[
                        exam.questions[currentQuestionIndex]?.id ?? ""
                      ] as string
                    }
                    onChange={(e) =>
                      handleAnswerChange(
                        exam.questions[currentQuestionIndex]?.id ?? "",
                        e.target.value,
                      )
                    }
                    placeholder="Enter your answer"
                    disabled={isSubmitted}
                    className={`w-full ${
                      mode === "review" &&
                      answers[exam.questions[currentQuestionIndex]?.id ?? ""]
                        ? isAnswerCorrect(
                            exam.questions[currentQuestionIndex]?.id ?? "",
                          )
                          ? "border-green-500"
                          : "border-orange-500"
                        : ""
                    }`}
                  />
                  {isSubmitted && (
                    <div className="rounded-md bg-muted p-4">
                      <p className="font-medium">Correct Answer:</p>
                      <p>
                        {exam.questions[currentQuestionIndex]?.correctAnswer}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {isSubmitted && (
                <div
                  className={`mt-2 rounded-md p-2 ${
                    isAnswerCorrect(
                      exam.questions[currentQuestionIndex]?.id ?? "",
                    )
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  {isAnswerCorrect(
                    exam.questions[currentQuestionIndex]?.id ?? "",
                  )
                    ? "Correct!"
                    : "Incorrect"}
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {exam?.questions?.map((_, index) => (
                    <Button
                      key={index}
                      variant={
                        index === currentQuestionIndex ? "default" : "outline"
                      }
                      size="icon"
                      className={`h-8 w-8 ${
                        completedQuestions.has(
                          exam?.questions?.[index]?.id ?? "",
                        )
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : ""
                      }`}
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={() =>
                    setCurrentQuestionIndex((prev) =>
                      Math.min(exam.questions.length - 1, prev + 1),
                    )
                  }
                  disabled={currentQuestionIndex === exam.questions.length - 1}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {mode === "review" && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const currentQuestionId =
                        exam.questions[currentQuestionIndex]?.id;
                      if (!currentQuestionId) return;

                      // Clear answer for current question only
                      setAnswers((prev) => {
                        const newAnswers = { ...prev };
                        delete newAnswers[currentQuestionId];
                        localStorage.setItem(
                          `exam-answers-${examId}`,
                          JSON.stringify(newAnswers),
                        );
                        return newAnswers;
                      });

                      // Remove from completed questions
                      setCompletedQuestions((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(currentQuestionId);
                        return newSet;
                      });

                      // Remove from answered questions
                      setAnsweredQuestions((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(currentQuestionId);
                        return newSet;
                      });

                      // Remove from selected answers
                      setSelectedAnswers((prev) => {
                        const newAnswers = { ...prev };
                        delete newAnswers[currentQuestionId];
                        return newAnswers;
                      });

                      // Update exam in localStorage to reset only current question
                      const savedExams = localStorage.getItem("exams");
                      if (savedExams) {
                        const exams = JSON.parse(savedExams) as Exam[];
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
                              completed: updatedQuestions.every(
                                (q) => q.completed,
                              ),
                            };
                          }
                          return e;
                        });
                        localStorage.setItem(
                          "exams",
                          JSON.stringify(updatedExams),
                        );

                        // Update local exam state
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
                      }

                      // Force a re-render of the current question
                      setCurrentQuestionIndex((prev) => prev);
                    }}
                  >
                    Reset Question
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
