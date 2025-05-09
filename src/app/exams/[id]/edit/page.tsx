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
import { PlusCircle, Trash2, Save, Home, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Checkbox } from "~/components/ui/checkbox";

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
}

interface Exam {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  icon?: string;
  folderId?: string;
  questions: Question[];
}

export default function EditExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam>({
    id: "",
    title: "",
    description: "",
    timeLimit: 60,
    questions: [],
  });

  useEffect(() => {
    // Load exam from localStorage
    const savedExams = localStorage.getItem("exams");
    if (savedExams) {
      const exams = JSON.parse(savedExams) as Exam[];
      const exam = exams.find((e) => e.id === examId);
      if (exam) {
        setExam({ ...exam });
      }
    }
  }, [examId]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: "multiple-choice",
      question: "",
      options: [{ text: "", image: undefined }],
      correctAnswer: "",
    };
    setExam((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...exam.questions];
    const question = newQuestions[questionIndex];
    if (!question) return;

    newQuestions[questionIndex] = {
      ...question,
      options: [...question.options, { text: "", image: undefined }],
    };
    setExam((prev) => ({ ...prev, questions: newQuestions }));
  };

  const removeQuestion = (index: number) => {
    if (exam.questions.length > 1) {
      const newQuestions = [...exam.questions];
      newQuestions.splice(index, 1);
      setExam((prev) => ({ ...prev, questions: newQuestions }));
    }
  };

  const updateQuestion = (
    questionIndex: number,
    field: keyof Question,
    value: Question[keyof Question],
  ) => {
    const newQuestions = [...exam.questions];
    const question = newQuestions[questionIndex];
    if (!question) return;

    newQuestions[questionIndex] = {
      ...question,
      [field]: value,
    };
    setExam((prev) => ({ ...prev, questions: newQuestions }));
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    const newQuestions = [...exam.questions];
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
    setExam((prev) => ({ ...prev, questions: newQuestions }));
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
      setExam((prev) => ({ ...prev, icon: reader.result as string }));
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
      setExam((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId
            ? { ...q, questionImage: reader.result as string }
            : q,
        ),
      }));
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
      setExam((prev) => ({
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
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedExam: Exam = {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      timeLimit: Number.parseInt(exam.timeLimit.toString()),
      icon: exam.icon,
      questions: exam.questions,
    };

    try {
      const savedExams = localStorage.getItem("exams");
      if (savedExams) {
        const exams = JSON.parse(savedExams) as Exam[];
        const updatedExams = exams.map((e) =>
          e.id === exam.id ? updatedExam : e,
        );
        localStorage.setItem("exams", JSON.stringify(updatedExams));
      }
      router.push("/");
    } catch (error) {
      if (error instanceof Error && error.name === "QuotaExceededError") {
        // Clear old exams to make space
        const oldExams = localStorage.getItem("exams");
        if (oldExams) {
          const exams = JSON.parse(oldExams) as Exam[];
          // Keep only the 5 most recent exams
          const recentExams = exams.slice(-5);
          localStorage.setItem(
            "exams",
            JSON.stringify([...recentExams, updatedExam]),
          );
        }
        router.push("/");
      } else {
        console.error("Error saving exam:", error);
        alert("Failed to save exam. Please try again.");
      }
    }
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
                      onClick={() =>
                        setExam((prev) => ({ ...prev, icon: undefined }))
                      }
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
                value={exam.title || ""}
                onChange={(e) => setExam({ ...exam, title: e.target.value })}
                placeholder="Enter exam title"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={exam.description || ""}
                onChange={(e) =>
                  setExam({ ...exam, description: e.target.value })
                }
                placeholder="Enter exam description"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
              <Input
                id="timeLimit"
                type="number"
                value={exam.timeLimit.toString()}
                onChange={(e) =>
                  setExam({
                    ...exam,
                    timeLimit: Number.parseInt(e.target.value),
                  })
                }
                min="1"
                required
              />
            </div>
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
                                setExam((prev) => ({
                                  ...prev,
                                  questions: prev.questions.map((q) =>
                                    q.id === question.id
                                      ? {
                                          ...q,
                                          options: q.options.map((opt, idx) =>
                                            idx === optionIndex
                                              ? { ...opt, image: undefined }
                                              : opt,
                                          ),
                                        }
                                      : q,
                                  ),
                                }))
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
                          onClick={() => {
                            setExam((prev) => ({
                              ...prev,
                              questions: prev.questions.map((q) =>
                                q.id === question.id
                                  ? {
                                      ...q,
                                      options: q.options.filter(
                                        (_, idx) => idx !== optionIndex,
                                      ),
                                    }
                                  : q,
                              ),
                            }));
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
                    value={question.correctAnswer}
                    onValueChange={(value) =>
                      updateQuestion(questionIndex, "correctAnswer", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options.map((option, optionIndex) => (
                        <SelectItem
                          key={`${question.id}-option-${optionIndex}`}
                          value={option.text}
                        >
                          {option.text}
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
                              : currentAnswers.filter((a) => a !== option.text);
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
                      updateQuestion(
                        questionIndex,
                        "correctAnswer",
                        e.target.value,
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
