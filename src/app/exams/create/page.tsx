"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  PlusCircle,
  Trash2,
  Save,
  Home,
} from "lucide-react";
import Link from "next/link";
import { Checkbox } from "~/components/ui/checkbox";
import type {
  Question,
  Exam,
  QuestionType,
} from "~/types";
import { SubjectSelector } from "~/components/SubjectSelector";
import { TopicManager } from "~/components/TopicManager";
import { useSubjects } from "~/hooks/useSubjects";
import { ImageUpload } from "~/components/ImageUpload";

export default function CreateExamPage() {
  const router = useRouter();
  const [examTitle, setExamTitle] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("30");
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const { availableSubjects, addSubject, removeSubject } = useSubjects();
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "q1",
      type: "multiple-choice",
      question: "",
      options: [{ text: "", image: undefined }],
      correctAnswer: "",
    },
  ]);

  const handleAddTopic = (topic: string) => {
    if (!topics.includes(topic)) {
      setTopics([...topics, topic]);
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter((topic) => topic !== topicToRemove));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: "multiple-choice",
      question: "",
      options: [{ text: "", image: undefined }],
      correctAnswer: "",
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (
    index: number,
    field: keyof Question,
    value: Question[keyof Question],
  ) => {
    const newQuestions = [...questions];
    const currentQuestion = newQuestions[index];
    if (!currentQuestion) return;

    if (field === "type") {
      const type = value as QuestionType;
      // Reset options based on question type
      if (type === "multiple-choice") {
        newQuestions[index] = {
          id: currentQuestion.id,
          type,
          question: currentQuestion.question,
          options: [{ text: "", image: undefined }],
          correctAnswer: "",
          correctAnswers: undefined,
        };
      } else if (type === "checkbox") {
        newQuestions[index] = {
          id: currentQuestion.id,
          type,
          question: currentQuestion.question,
          options: [{ text: "", image: undefined }],
          correctAnswers: [],
          correctAnswer: undefined,
        };
      } else if (type === "text") {
        newQuestions[index] = {
          id: currentQuestion.id,
          type,
          question: currentQuestion.question,
          options: [],
          correctAnswer: "",
          correctAnswers: undefined,
        };
      }
    } else {
      newQuestions[index] = {
        ...currentQuestion,
        [field]: value,
      };
    }

    setQuestions(newQuestions);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];
    if (!question) return;

    newQuestions[questionIndex] = {
      ...question,
      options: [...question.options, { text: "", image: undefined }],
    };
    setQuestions(newQuestions);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];
    if (!question) return;

    const newOptions = [...question.options];
    newOptions[optionIndex] = {
      ...newOptions[optionIndex],
      text: value,
    };
    newQuestions[questionIndex] = {
      ...question,
      options: newOptions,
    };
    setQuestions(newQuestions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const exam: Exam = {
      id: crypto.randomUUID(),
      title: examTitle,
      description: examDescription,
      timeLimit: Number.parseInt(timeLimit),
      icon: selectedIcon,
      questions,
      subject: selectedSubject,
      topics,
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
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Create New Exam</h1>
        <Link href="/">
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mx-auto max-w-3xl">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Exam Icon</Label>
                <ImageUpload
                  id="exam-icon"
                  value={selectedIcon}
                  onChange={setSelectedIcon}
                  uploadButtonText="Upload exam icon"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title">Exam Title</Label>
                <Input
                  id="title"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="Enter exam title"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={examDescription}
                  onChange={(e) => setExamDescription(e.target.value)}
                  placeholder="Enter exam description"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <SubjectSelector
                selectedSubject={selectedSubject}
                availableSubjects={availableSubjects}
                onSubjectSelect={setSelectedSubject}
                onSubjectRemove={removeSubject}
                onNewSubject={addSubject}
              />

              <TopicManager
                topics={topics}
                onAddTopic={handleAddTopic}
                onRemoveTopic={handleRemoveTopic}
              />
            </CardContent>
          </Card>

          <h2 className="mb-4 text-xl font-bold">Questions</h2>

          {questions.map((question, index) => (
            <Card key={question.id} className="mb-4">
              <CardHeader>
                <CardTitle>Question {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Textarea
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(index, "question", e.target.value)
                    }
                    placeholder="Enter your question"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Question Image (Optional)</Label>
                  <ImageUpload
                    id={`question-image-${question.id}`}
                    value={question.image}
                    onChange={(value: string | null) => updateQuestion(index, "image", value)}
                    aspectRatio="video"
                    uploadButtonText="Add image to question"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Options</Label>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={option.text}
                          onChange={(e) =>
                            updateOption(index, optionIndex, e.target.value)
                          }
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                        <div className="space-y-2">
                          <Label>Option Image (Optional)</Label>
                          <ImageUpload
                            id={`option-image-${question.id}-${optionIndex}`}
                            value={option.image}
                            onChange={(value: string | null) => {
                              const newOptions = [...question.options];
                              const currentOption = newOptions[optionIndex];
                              if (!currentOption) return;
                              
                              newOptions[optionIndex] = { 
                                text: currentOption.text,
                                image: value 
                              };
                              updateQuestion(index, "options", newOptions);
                            }}
                            uploadButtonText="Add image to option"
                          />
                        </div>
                        {question.options.length > 1 && (
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              setQuestions((prev) =>
                                prev.map((q) =>
                                  q.id === question.id
                                    ? {
                                        ...q,
                                        options: q.options.filter(
                                          (_, idx) => idx !== optionIndex,
                                        ),
                                      }
                                    : q,
                                ),
                              );
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addOption(index)}
                    className="mt-2"
                  >
                    Add Option
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select
                    value={question.type}
                    onValueChange={(value) =>
                      updateQuestion(index, "type", value as QuestionType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">
                        Multiple Choice
                      </SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {question.type === "multiple-choice" && (
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <Select
                      value={question.correctAnswer ?? ""}
                      onValueChange={(value) =>
                        updateQuestion(index, "correctAnswer", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        {question.options.map((option, optionIndex) => (
                          <SelectItem
                            key={`${question.id}-option-${optionIndex}`}
                            value={option.text || `option-${optionIndex}`}
                          >
                            {option.text || `Option ${optionIndex + 1}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {question.type === "checkbox" && (
                  <div className="space-y-2">
                    <Label>Correct Answers</Label>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={`${question.id}-option-${optionIndex}`}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`correct-${question.id}-${optionIndex}`}
                            checked={question.correctAnswers?.includes(
                              option.text,
                            )}
                            onCheckedChange={(checked) => {
                              const currentAnswers =
                                question.correctAnswers ?? [];
                              const newAnswers = checked
                                ? [...currentAnswers, option.text]
                                : currentAnswers.filter(
                                    (a) => a !== option.text,
                                  );
                              updateQuestion(
                                index,
                                "correctAnswers",
                                newAnswers,
                              );
                            }}
                          />
                          <Label
                            htmlFor={`correct-${question.id}-${optionIndex}`}
                          >
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {question.type === "text" && (
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <Input
                      value={question.correctAnswer ?? ""}
                      onChange={(e) =>
                        updateQuestion(index, "correctAnswer", e.target.value)
                      }
                      placeholder="Enter correct answer"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" onClick={addQuestion}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Question
            </Button>

            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Exam
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
