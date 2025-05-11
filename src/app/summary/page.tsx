"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import {
  Home,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  X,
  Printer,
  Download,
} from "lucide-react";
import Link from "next/link";
import type {
  ExamSummary,
  ExamHistory,
  Exam,
  SortField,
  SortOrder,
} from "~/types";

export default function SummaryPage() {
  const [summaries, setSummaries] = useState<ExamSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [examHistory, setExamHistory] = useState<ExamHistory | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const savedSummaries = localStorage.getItem("examSummaries");
    if (savedSummaries) {
      const parsedSummaries = JSON.parse(savedSummaries) as ExamSummary[];
      setSummaries(parsedSummaries);
    }
  }, []);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleShowDetails = (examId: string) => {
    const savedHistory = localStorage.getItem(`exam-history-${examId}`);
    const savedExams = localStorage.getItem("exams");

    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory) as ExamHistory;
      setExamHistory(parsedHistory);
      setSelectedExamId(examId);
    }

    if (savedExams) {
      const exams = JSON.parse(savedExams) as Exam[];
      const exam = exams.find((e) => e.id === examId);
      if (exam) {
        setSelectedExam(exam);
        setIsDetailsOpen(true);
      }
    }
  };

  const calculateTopicPerformance = () => {
    if (!examHistory || !selectedExam) return {};

    const topicStats: Record<string, { correct: number; total: number }> = {};

    examHistory.attempts[
      examHistory.attempts.length - 1
    ]?.questionStats.forEach((stat) => {
      const question = selectedExam.questions.find(
        (q) => q.id === stat.questionId,
      );
      if (!question?.topics) return;

      question.topics.forEach((topic) => {
        topicStats[topic] ??= { correct: 0, total: 0 };
        topicStats[topic].total += 1;
        if (stat.isCorrect) {
          topicStats[topic].correct += 1;
        }
      });
    });

    return topicStats;
  };

  const filteredAndSortedSummaries = summaries
    .filter((summary) =>
      summary.examTitle.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      const order = sortOrder === "asc" ? 1 : -1;
      switch (sortField) {
        case "date":
          return (
            (new Date(a.date).getTime() - new Date(b.date).getTime()) * order
          );
        case "examTitle":
          return a.examTitle.localeCompare(b.examTitle) * order;
        case "score":
          return (a.score - b.score) * order;
        case "timeSpent":
          return (a.timeSpent - b.timeSpent) * order;
        default:
          return 0;
      }
    });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Summaries</h1>
          <p className="text-muted-foreground">
            View and analyze your exam performance
          </p>
        </div>
        <Link href="/">
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Your overall exam statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Total Exams Taken
              </div>
              <div className="text-2xl font-bold">{summaries.length}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Average Score
              </div>
              <div className="text-2xl font-bold">
                {summaries.length > 0
                  ? (
                      summaries.reduce((acc, curr) => acc + curr.score, 0) /
                      summaries.length
                    ).toFixed(1)
                  : "0"}
                %
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Best Score
              </div>
              <div className="text-2xl font-bold">
                {summaries.length > 0
                  ? Math.max(...summaries.map((s) => s.score)).toFixed(1)
                  : "0"}
                %
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Average Time per Exam
              </div>
              <div className="text-2xl font-bold">
                {summaries.length > 0
                  ? Math.round(
                      summaries.reduce((acc, curr) => acc + curr.timeSpent, 0) /
                        summaries.length,
                    )
                  : "0"}{" "}
                min
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <Input
          placeholder="Search exams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const csv = [
                ["Date", "Exam Title", "Score", "Questions", "Time Spent"],
                ...summaries.map((s) => [
                  s.date,
                  s.examTitle,
                  `${s.score.toFixed(1)}%`,
                  `${s.correctAnswers}/${s.totalQuestions}`,
                  `${s.timeSpent} min`,
                ]),
              ]
                .map((row) => row.join(","))
                .join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "exam-summaries.csv";
              a.click();
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center gap-2">
                    Date
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("examTitle")}
                >
                  <div className="flex items-center gap-2">
                    Exam Title
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("score")}
                >
                  <div className="flex items-center gap-2">
                    Score
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Questions</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("timeSpent")}
                >
                  <div className="flex items-center gap-2">
                    Time Spent
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedSummaries.map((summary) => (
                <TableRow key={summary.id}>
                  <TableCell>{summary.date}</TableCell>
                  <TableCell>{summary.examTitle}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {summary.score.toFixed(1)}%
                      {summary.score >= 70 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {summary.correctAnswers} / {summary.totalQuestions}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {summary.timeSpent} min
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShowDetails(summary.examId)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedExamId && examHistory && selectedExam && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedExam.title}</CardTitle>
                <CardDescription>{selectedExam.description}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedExamId(null);
                  setExamHistory(null);
                  setSelectedExam(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Subject
                </div>
                <div className="text-lg font-semibold">
                  {selectedExam.subject ?? "Not specified"}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Topics
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedExam.topics?.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full bg-secondary px-2 py-1 text-xs"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Average Time per Question
                </div>
                <div className="text-lg font-semibold">
                  {formatTime(examHistory.averageTimePerQuestion)}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Best Score
                </div>
                <div className="text-lg font-semibold">
                  {examHistory.bestScore.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Question Details</h3>
              <div className="space-y-4">
                {examHistory.attempts[
                  examHistory.attempts.length - 1
                ]?.questionStats.map((stat, index) => {
                  const question = selectedExam.questions.find(
                    (q) => q.id === stat.questionId,
                  );
                  if (!question) return null;

                  return (
                    <div
                      key={stat.questionId}
                      className="rounded-lg border p-4"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="font-medium">
                              Question {index + 1}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {question.question}
                            </div>
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

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="rounded-lg bg-muted p-3">
                            <div className="text-sm font-medium text-muted-foreground">
                              Time Spent
                            </div>
                            <div className="text-lg font-semibold">
                              {formatTime(stat.timeSpent)}
                            </div>
                          </div>
                          {question.subject && (
                            <div className="rounded-lg bg-muted p-3">
                              <div className="text-sm font-medium text-muted-foreground">
                                Subject
                              </div>
                              <div className="text-lg font-semibold">
                                {question.subject}
                              </div>
                            </div>
                          )}
                          {question.topics && question.topics.length > 0 && (
                            <div className="rounded-lg bg-muted p-3">
                              <div className="text-sm font-medium text-muted-foreground">
                                Topics
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {question.topics.map((topic) => (
                                  <span
                                    key={topic}
                                    className="rounded-full bg-secondary px-2 py-1 text-xs"
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
