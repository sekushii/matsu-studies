import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatTime } from "~/lib/utils";
import type { ExamHistory, Exam } from "~/types";

interface ExamSubmitSummaryProps {
  examHistory: ExamHistory;
  exam: Exam;
}

export function ExamSubmitSummary({ examHistory, exam }: ExamSubmitSummaryProps) {
  return <Card className="mb-8">
    <CardHeader>
      <CardTitle>Exam Summary</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Score
          </div>
          <div className="text-2xl font-bold">
            {examHistory.attempts[
              examHistory.attempts.length - 1
            ]?.score.toFixed(1)}
            %
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Time Spent
          </div>
          <div className="text-2xl font-bold">
            {formatTime(
              examHistory.attempts[examHistory.attempts.length - 1]
                ?.totalTime ?? 0,
            )}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Correct Answers
          </div>
          <div className="text-2xl font-bold">
            {examHistory.attempts[examHistory.attempts.length - 1]
              ?.correctAnswers ?? 0}{" "}
            /{" "}
            {examHistory.attempts[examHistory.attempts.length - 1]
              ?.totalQuestions ?? 0}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Average Time per Question
          </div>
          <div className="text-2xl font-bold">
            {formatTime(examHistory.averageTimePerQuestion)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Question Details</h3>
        <div className="space-y-2">
          {examHistory.attempts[
            examHistory.attempts.length - 1
          ]?.questionStats.map((stat, index) => {
            const question = exam?.questions?.find(
              (q) => q.id === stat.questionId,
            );
            if (!question) return null;
            return (
              <div
                key={stat.questionId}
                className="rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">
                      Question {index + 1}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {question.question}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      Time: {formatTime(stat.timeSpent)}
                    </div>
                    <div
                      className={`rounded-full px-2 py-1 text-sm ${
                        stat.isCorrect
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {stat.isCorrect ? "Correct" : "Incorrect"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Exam History</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium text-muted-foreground">
              Best Score
            </div>
            <div className="text-2xl font-bold">
              {examHistory.bestScore.toFixed(1)}%
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium text-muted-foreground">
              Average Score
            </div>
            <div className="text-2xl font-bold">
              {examHistory.averageScore.toFixed(1)}%
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium text-muted-foreground">
              Total Attempts
            </div>
            <div className="text-2xl font-bold">
              {examHistory.totalAttempts}
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

}

