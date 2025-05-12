"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { X, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Checkbox } from "~/components/ui/checkbox";
import type { Exam, Question } from "~/types";

interface QuestionWithExamInfo extends Question {
  examId: string;
  examTitle: string;
}

export default function QuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionWithExamInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [, setAvailableTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    const loadQuestions = () => {
      const exams = JSON.parse(localStorage.getItem("exams") ?? "[]") as Exam[];

      const allQuestions = exams.flatMap((exam) =>
        exam.questions.map(
          (q) =>
            ({
              ...q,
              examId: exam.id,
              examTitle: exam.title,
            }) as QuestionWithExamInfo,
        ),
      );

      setQuestions(allQuestions);

      // Extract unique subjects and topics
      const subjects = new Set<string>();
      const topics = new Set<string>();
      allQuestions.forEach((question) => {
        if (question.subject) subjects.add(question.subject);
        question.topics?.forEach((topic) => topics.add(topic));
      });
      setAvailableSubjects(Array.from(subjects));
      setAvailableTopics(Array.from(topics));
    };

    loadQuestions();
  }, []);

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.question
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesSubject =
      selectedSubject === "all" || question.subject === selectedSubject;
    const matchesTopics =
      selectedTopics.length === 0 ||
      selectedTopics.every((topic) => question.topics?.includes(topic));
    return matchesSearch && matchesSubject && matchesTopics;
  });

  const handleAddTopic = () => {
    const topic = topicInput.trim();
    if (topic && !selectedTopics.includes(topic)) {
      setSelectedTopics([...selectedTopics, topic]);
      setTopicInput("");
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setSelectedTopics(
      selectedTopics.filter((topic) => topic !== topicToRemove),
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTopic();
    }
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleCreateExamFromFilter = () => {
    const questionsToInclude =
      selectedQuestions.size > 0
        ? filteredQuestions.filter((q) => selectedQuestions.has(q.id))
        : filteredQuestions;

    if (questionsToInclude.length === 0) {
      alert(
        "Please select at least one question or use filters to include questions.",
      );
      return;
    }

    const examTitle = `Exam from ${selectedSubject !== "all" ? selectedSubject : "All Subjects"}${
      selectedTopics.length > 0 ? ` - ${selectedTopics.join(", ")}` : ""
    }`;

    const examId = crypto.randomUUID();
    const exam: Exam = {
      id: examId,
      title: examTitle,
      description: `Exam created from ${selectedQuestions.size > 0 ? "selected" : "filtered"} questions${
        selectedSubject !== "all" ? ` for subject: ${selectedSubject}` : ""
      }${
        selectedTopics.length > 0
          ? ` with topics: ${selectedTopics.join(", ")}`
          : ""
      }`,
      timeLimit: 30,
      questions: questionsToInclude.map((q) => ({
        id: crypto.randomUUID(),
        type: q.type,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        examId,
        examTitle,
        subject: q.subject,
        topics: q.topics,
      })),
      subject: selectedSubject !== "all" ? selectedSubject : undefined,
      topics: selectedTopics,
    };

    // Save exam to localStorage
    const savedExams = localStorage.getItem("exams");
    const exams: Exam[] = savedExams ? (JSON.parse(savedExams) as Exam[]) : [];
    exams.push(exam);
    localStorage.setItem("exams", JSON.stringify(exams));

    alert("Exam created successfully!");
    router.push("/");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Questions</h1>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="w-48">
                  <Select
                    value={selectedSubject}
                    onValueChange={setSelectedSubject}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All subjects</SelectItem>
                      {availableSubjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedTopics.map((topic) => (
                  <Badge
                    key={topic}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {topic}
                    <button
                      onClick={() => handleRemoveTopic(topic)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add topic filter..."
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="h-8 w-48"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddTopic}
                    className="h-8"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Exam Creator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                {selectedQuestions.size > 0 ? (
                  <>
                    Creating exam from {selectedQuestions.size} selected
                    questions
                    {selectedSubject !== "all" && (
                      <div>Subject: {selectedSubject}</div>
                    )}
                    {selectedTopics.length > 0 && (
                      <div>Topics: {selectedTopics.join(", ")}</div>
                    )}
                  </>
                ) : (
                  <>
                    Create a new exam from the currently filtered questions.
                    {selectedSubject !== "all" && (
                      <div>Subject: {selectedSubject}</div>
                    )}
                    {selectedTopics.length > 0 && (
                      <div>Topics: {selectedTopics.join(", ")}</div>
                    )}
                    <div>Questions: {filteredQuestions.length}</div>
                  </>
                )}
              </p>
              <Button
                onClick={handleCreateExamFromFilter}
                disabled={filteredQuestions.length === 0}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Exam{" "}
                {selectedQuestions.size > 0 ? "from Selection" : "from Filter"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {filteredQuestions.map((question) => (
          <Card key={question.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Checkbox
                      checked={selectedQuestions.has(question.id)}
                      onCheckedChange={() =>
                        toggleQuestionSelection(question.id)
                      }
                      className="mr-2"
                    />
                    <Badge variant="outline">{question.type}</Badge>
                    {question.subject && (
                      <Badge variant="secondary">{question.subject}</Badge>
                    )}
                    {question.topics?.map((topic) => (
                      <Badge key={topic} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  <p className="mb-2 text-lg">{question.question}</p>
                  {question.type === "multiple-choice" && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, index) => (
                        <div
                          key={index}
                          className={`rounded p-2 ${
                            option.text === question.correctAnswer
                              ? "bg-green-100 dark:bg-green-900"
                              : "bg-gray-100 dark:bg-gray-800"
                          }`}
                        >
                          {option.text}
                        </div>
                      ))}
                    </div>
                  )}
                  {question.type === "checkbox" && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, index) => (
                        <div
                          key={index}
                          className={`rounded p-2 ${
                            (
                              question.correctAnswer ?? ([] as string[])
                            )?.includes(option.text)
                              ? "bg-green-100 dark:bg-green-900"
                              : "bg-gray-100 dark:bg-gray-800"
                          }`}
                        >
                          {option.text}
                        </div>
                      ))}
                    </div>
                  )}
                  {question.type === "text" && question.correctAnswer && (
                    <div className="rounded bg-green-100 p-2 dark:bg-green-900">
                      {question.correctAnswer}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <Link href={`/exams/${question.examId}/review`}>
                    <Button variant="outline" size="sm">
                      View in Exam
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                From exam: {question.examTitle}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
