"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowLeft, ArrowRight, Clock, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ExamHeader } from "./_components/ExamHeader";
import { formatTime } from "~/lib/utils";
import { ExamSubmitSummary } from "./_components/ExamSubmitSummary";
import { ExamTips } from "./_components/ExamTips";
import { ExamNotes } from "./_components/ExamNotes";
import { useExam } from "./_hooks/_hooks";
import { ExamQuestions } from "./_components/ExamQuestions";

export default function ExamPage() {
  const params = useParams();
  const examId = params.id as string;
  const mode = params.mode as "review" | "take";

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [showTips, setShowTips] = useState(false);

  const {
    exam,
    timeLeft,
    completedQuestions,
    answers,
    examHistory,
    handleSubmit,
    handleAnswerChange,
    isAnswerCorrect,
    resetQuestion,
    isSubmitted,
    setExam,
  } = useExam({
    examId,
    mode,
    currentQuestionIndex,
    setCurrentQuestionIndex,
  });

  if (!exam) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Exam was not found</h1>
          <Link href="/main">
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
          <Link href="/main">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <ExamHeader exam={exam} />

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

      {mode === "take" && isSubmitted && examHistory && (
        <ExamSubmitSummary examHistory={examHistory} exam={exam} />
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

              {exam.questions[currentQuestionIndex]?.image && (
                <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-md">
                  <Image
                    src={exam.questions[currentQuestionIndex]?.image ?? ""}
                    alt="Question"
                    fill
                    className="object-contain"
                  />
                </div>
              )}

              <ExamQuestions
                exam={exam}
                currentQuestionIndex={currentQuestionIndex}
                answers={answers}
                isSubmitted={isSubmitted}
                mode={mode}
                type={exam.questions[currentQuestionIndex]?.type}
                handleAnswerChange={handleAnswerChange}
                isAnswerCorrect={isAnswerCorrect}
              />

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
                <div className="mt-4 space-y-4">
                  <ExamTips
                    exam={exam}
                    currentQuestionIndex={currentQuestionIndex}
                    setExam={setExam}
                    isVisible={showTips}
                    onToggle={setShowTips}
                  />
                  <ExamNotes
                    exam={exam}
                    currentQuestionIndex={currentQuestionIndex}
                    setExam={setExam}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={resetQuestion(exam)}>
                      Reset Question
                    </Button>
                    <Link href={`/exams/${examId}/edit`}>
                      <Button variant="outline">Edit Question</Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
