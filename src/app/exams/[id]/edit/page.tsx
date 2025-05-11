"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Upload,
  X,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Checkbox } from "~/components/ui/checkbox";
import type {
  Question,
  Exam,
  QuestionType,
} from "~/types";
import { SubjectSelector } from "~/components/SubjectSelector";
import { TopicManager } from "~/components/TopicManager";
import { useSubjects } from "~/hooks/useSubjects";

export default function EditExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const { availableSubjects, addSubject, removeSubject } = useSubjects();
  const [questionTopicInput, setQuestionTopicInput] = useState("");

  useEffect(() => {
    // Load exam from localStorage
    const savedExams = localStorage.getItem("exams");

    if (savedExams) {
      const exams = JSON.parse(savedExams) as Exam[];
      const foundExam = exams.find((e) => e.id === examId);
      if (foundExam) {
        // Ensure all required fields are present
        const initializedExam: Exam = {
          id: foundExam.id,
          title: foundExam.title || "",
          description: foundExam.description || "",
          timeLimit: foundExam.timeLimit || 0,
          icon: foundExam.icon,
          folderId: foundExam.folderId,
          questions: foundExam.questions || [],
          subject: foundExam.subject ?? "",
          topics: foundExam.topics ?? [],
        };
        setExam(initializedExam);
      }
    }
  }, [examId]);

  const handleAddTopic = (topic: string) => {
    setExam((prev) => {
      if (!prev) return prev;
      if (prev?.topics?.includes(topic)) return prev;
      return {
        ...prev,
        topics: [...(prev.topics ?? []), topic],
      };
    });
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setExam((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        topics: (prev.topics ?? []).filter((topic) => topic !== topicToRemove),
      };
    });
  };

  const addQuestion = () => {
    setExam((prev) => {
      if (!prev) return prev;
      const newQuestion: Question = {
        id: crypto.randomUUID(),
        type: "multiple-choice",
        question: "",
        options: [{ text: "", image: undefined }],
        correctAnswer: "",
      };
      return {
        ...prev,
        questions: [...prev.questions, newQuestion],
      };
    });
  };

  const addOption = (questionIndex: number) => {
    setExam((prev) => {
      if (!prev) return prev;
      const newQuestions = [...prev.questions];
      const question = newQuestions[questionIndex];
      if (!question) return prev;

      newQuestions[questionIndex] = {
        ...question,
        options: [...question.options, { text: "", image: undefined }],
      };
      return {
        ...prev,
        questions: newQuestions,
      };
    });
  };

  const removeQuestion = (index: number) => {
    setExam((prev) => {
      if (!prev) return prev;
      if (prev.questions.length <= 1) return prev;
      const newQuestions = [...prev.questions];
      newQuestions.splice(index, 1);
      return {
        ...prev,
        questions: newQuestions,
      };
    });
  };

  const updateQuestion = (
    questionIndex: number,
    field: keyof Question,
    value: Question[keyof Question],
  ) => {
    setExam((prev) => {
      if (!prev) return prev;
      const newQuestions = [...prev.questions];
      const question = newQuestions[questionIndex];
      if (!question) return prev;

      newQuestions[questionIndex] = {
        ...question,
        [field]: value,
      };
      return {
        ...prev,
        questions: newQuestions,
      };
    });
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    setExam((prev) => {
      if (!prev) return prev;
      const newQuestions = [...prev.questions];
      const question = newQuestions[questionIndex];
      if (!question) return prev;

      const newOptions = [...question.options];
      newOptions[optionIndex] = {
        ...newOptions[optionIndex],
        text: value,
      };
      newQuestions[questionIndex] = {
        ...question,
        options: newOptions,
      };
      return {
        ...prev,
        questions: newQuestions,
      };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setExam((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          icon: reader.result as string,
        };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleQuestionImageUpload = (
    questionId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setExam((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: prev.questions.map((q) =>
            q.id === questionId
              ? { ...q, questionImage: reader.result as string }
              : q,
          ),
        };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleOptionImageUpload = (
    questionId: string,
    optionIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setExam((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: prev.questions.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  options: q.options.map((opt, idx) =>
                    idx === optionIndex
                      ? { ...opt, image: reader.result as string }
                      : opt,
                  ),
                }
              : q,
          ),
        };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveIcon = () => {
    setExam((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        icon: undefined,
      };
    });
  };

  const handleRemoveOptionImage = (questionId: string, optionIndex: number) => {
    setExam((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId
            ? {
                ...q,
                options: q.options.map((opt, idx) =>
                  idx === optionIndex ? { ...opt, image: undefined } : opt,
                ),
              }
            : q,
        ),
      };
    });
  };

  const handleRemoveOption = (questionId: string, optionIndex: number) => {
    setExam((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId
            ? {
                ...q,
                options: q.options.filter((_, idx) => idx !== optionIndex),
              }
            : q,
        ),
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam) return;

    try {
      // Save exam to localStorage
      const oldExams = localStorage.getItem("exams");
      if (oldExams) {
        const exams = JSON.parse(oldExams) as Exam[];
        const updatedExams = exams.map((e) => (e.id === examId ? exam : e));
        localStorage.setItem("exams", JSON.stringify(updatedExams));
      }
      router.push("/");
    } catch (error) {
      console.error("Error saving exam:", error);
      alert("Failed to save exam. Please try again.");
    }
  };

  if (!exam) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Exam not found</h1>
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

  const updateExam = (updates: Partial<Exam>) => {
    setExam((prev) => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
  };

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Exam</h1>
        <Link href="/">
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Exam Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="icon">Exam Icon</Label>
              <div className="flex items-center gap-4">
                {exam.icon && (
                  <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                    <Image
                      src={exam.icon}
                      alt="Exam icon"
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-1 top-1 h-6 w-6"
                      onClick={handleRemoveIcon}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="icon"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Label
                    htmlFor="icon"
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed p-4 hover:bg-muted"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload an image (max 2MB)</span>
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Exam Title</Label>
              <Input
                id="title"
                value={exam.title}
                onChange={(e) => updateExam({ title: e.target.value })}
                placeholder="Enter exam title"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={exam.description}
                onChange={(e) => updateExam({ description: e.target.value })}
                placeholder="Enter exam description"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
              <Input
                id="timeLimit"
                type="number"
                value={exam.timeLimit}
                onChange={(e) => updateExam({ timeLimit: parseInt(e.target.value) || 0 })}
                min="1"
                required
              />
            </div>

            <SubjectSelector
              selectedSubject={exam.subject ?? ""}
              availableSubjects={availableSubjects}
              onSubjectSelect={(subject) => updateExam({ subject })}
              onSubjectRemove={removeSubject}
              onNewSubject={addSubject}
            />

            <TopicManager
              topics={exam.topics ?? []}
              onAddTopic={handleAddTopic}
              onRemoveTopic={handleRemoveTopic}
            />
          </CardContent>
        </Card>

        <h2 className="mb-4 text-xl font-bold">Questions</h2>

        {exam.questions.map((question, questionIndex) => (
          <Card key={question.id} className="mb-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Question {questionIndex + 1}</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(questionIndex)}
                disabled={exam.questions.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select
                  value={question.type}
                  onValueChange={(value) =>
                    updateQuestion(questionIndex, "type", value as QuestionType)
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select
                    value={question.subject ?? "none"}
                    onValueChange={(value) =>
                      updateQuestion(
                        questionIndex,
                        "subject",
                        value === "none" ? undefined : value,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableSubjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Topics</Label>
                  <div className="flex flex-col gap-2">
                    {question.topics && question.topics.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {question.topics.map((topic) => (
                          <div
                            key={topic}
                            className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1"
                          >
                            <span>{topic}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() => {
                                const newTopics =
                                  question.topics?.filter((t) => t !== topic) ??
                                  [];
                                updateQuestion(
                                  questionIndex,
                                  "topics",
                                  newTopics,
                                );
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        value={questionTopicInput}
                        onChange={(e) => setQuestionTopicInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && questionTopicInput.trim()) {
                            e.preventDefault();
                            const newTopics = [
                              ...(question.topics ?? []),
                              questionTopicInput.trim(),
                            ];
                            updateQuestion(questionIndex, "topics", newTopics);
                            setQuestionTopicInput("");
                          }
                        }}
                        placeholder="Type a topic and press Enter"
                        className="w-full"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (questionTopicInput.trim()) {
                            const newTopics = [
                              ...(question.topics ?? []),
                              questionTopicInput.trim(),
                            ];
                            updateQuestion(questionIndex, "topics", newTopics);
                            setQuestionTopicInput("");
                          }
                        }}
                        disabled={!questionTopicInput.trim()}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Question Text</Label>
                <Textarea
                  value={question.question || ""}
                  onChange={(e) =>
                    updateQuestion(questionIndex, "question", e.target.value)
                  }
                  placeholder="Enter your question"
                />
                <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-md border">
                  {question.questionImage ? (
                    <>
                      <Image
                        src={question.questionImage}
                        alt="Question"
                        fill
                        className="object-contain"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() =>
                          updateQuestion(
                            questionIndex,
                            "questionImage",
                            undefined,
                          )
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Label
                      htmlFor={`question-image-${question.id}`}
                      className="flex h-full w-full cursor-pointer items-center justify-center"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <input
                        id={`question-image-${question.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleQuestionImageUpload(question.id, e)
                        }
                      />
                    </Label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                {question.options.map((option, optionIndex) => (
                  <div
                    key={`${question.id}-option-${optionIndex}`}
                    className="space-y-2"
                  >
                    <div className="flex gap-2">
                      <Input
                        value={option.text || ""}
                        onChange={(e) =>
                          updateOption(
                            questionIndex,
                            optionIndex,
                            e.target.value,
                          )
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      <div className="relative aspect-square w-24 overflow-hidden rounded-md border">
                        {option.image ? (
                          <>
                            <Image
                              src={option.image}
                              alt={`Option ${optionIndex + 1}`}
                              fill
                              className="object-contain"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute right-1 top-1"
                              onClick={() =>
                                handleRemoveOptionImage(
                                  question.id,
                                  optionIndex,
                                )
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <Label
                            htmlFor={`option-image-${question.id}-${optionIndex}`}
                            className="flex h-full w-full cursor-pointer items-center justify-center"
                          >
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <input
                              id={`option-image-${question.id}-${optionIndex}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleOptionImageUpload(
                                  question.id,
                                  optionIndex,
                                  e,
                                )
                              }
                            />
                          </Label>
                        )}
                      </div>
                      {question.options.length > 1 && (
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() =>
                            handleRemoveOption(question.id, optionIndex)
                          }
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
                  onClick={() => addOption(questionIndex)}
                  className="mt-2"
                >
                  Add Option
                </Button>
              </div>

              {question.type === "multiple-choice" && (
                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <Select
                    value={question.correctAnswer ?? "none"}
                    onValueChange={(value) =>
                      updateQuestion(
                        questionIndex,
                        "correctAnswer",
                        value === "none" ? undefined : value,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" disabled>
                        Select an answer
                      </SelectItem>
                      {question.options.map((option, optionIndex) => {
                        const optionText =
                          option.text || `Option ${optionIndex + 1}`;
                        return (
                          <SelectItem
                            key={`${question.id}-option-${optionIndex}`}
                            value={optionText}
                          >
                            {optionText}
                          </SelectItem>
                        );
                      })}
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
                            option.text ?? `Option ${optionIndex + 1}`,
                          )}
                          onCheckedChange={(checked) => {
                            const currentAnswers =
                              question.correctAnswers ?? [];
                            const optionText =
                              option.text ?? `Option ${optionIndex + 1}`;
                            const newAnswers = checked
                              ? [...currentAnswers, optionText]
                              : currentAnswers.filter((a) => a !== optionText);
                            updateQuestion(
                              questionIndex,
                              "correctAnswers",
                              newAnswers,
                            );
                          }}
                        />
                        <Label
                          htmlFor={`correct-${question.id}-${optionIndex}`}
                        >
                          {option.text ?? `Option ${optionIndex + 1}`}
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
                      updateQuestion(
                        questionIndex,
                        "correctAnswer",
                        e.target.value || undefined,
                      )
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
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
