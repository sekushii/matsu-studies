"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
  SubjectSelectorProps,
  QuestionType,
} from "~/types";

const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  selectedSubject,
  availableSubjects,
  onSubjectSelect,
  onSubjectRemove,
  onNewSubject,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input && !availableSubjects.includes(input)) {
      e.preventDefault();
      onNewSubject(input);
      setInput("");
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="subject">Subject</Label>
      <div className="flex flex-col gap-2">
        {selectedSubject && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
              <span>{selectedSubject}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => onSubjectSelect("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between"
              onClick={() => setIsOpen(!isOpen)}
            >
              Select a subject
              <ChevronDown className="h-4 w-4" />
            </Button>
            {isOpen && (
              <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                {availableSubjects.map((subj) => (
                  <div
                    key={subj}
                    className="flex items-center justify-between px-2 py-1.5 hover:bg-accent"
                  >
                    <button
                      type="button"
                      className="flex-1 text-left"
                      onClick={() => {
                        onSubjectSelect(subj);
                        setIsOpen(false);
                      }}
                    >
                      {subj}
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSubjectRemove(subj);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Or type a new subject and press Enter"
              className="w-full"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (input && !availableSubjects.includes(input)) {
                  onNewSubject(input);
                  setInput("");
                }
              }}
              disabled={!input}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CreateExamPage() {
  const router = useRouter();
  const [examTitle, setExamTitle] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("30");
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "q1",
      type: "multiple-choice",
      question: "",
      options: [{ text: "", image: undefined }],
      correctAnswer: "",
    },
  ]);

  useEffect(() => {
    const savedSubjects = localStorage.getItem("exam-subjects");

    if (savedSubjects) {
      setAvailableSubjects(JSON.parse(savedSubjects) as string[]);
    }
  }, []);

  const handleNewSubject = (subject: string) => {
    const newSubjects = [...availableSubjects, subject];
    setAvailableSubjects(newSubjects);
    setSelectedSubject(subject);
    localStorage.setItem("exam-subjects", JSON.stringify(newSubjects));
  };

  const handleRemoveAvailableSubject = (subject: string) => {
    const newSubjects = availableSubjects.filter((s) => s !== subject);
    setAvailableSubjects(newSubjects);
    localStorage.setItem("exam-subjects", JSON.stringify(newSubjects));
    if (selectedSubject === subject) {
      setSelectedSubject("");
    }
  };

  const handleAddTopic = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && topicInput.trim()) {
      e.preventDefault();
      if (!topics.includes(topicInput.trim())) {
        setTopics([...topics, topicInput.trim()]);
      }
      setTopicInput("");
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter((topic) => topic !== topicToRemove));
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
      setSelectedIcon(reader.result as string);
    };
    reader.readAsDataURL(file);
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
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, questionImage: reader.result as string }
            : q,
        ),
      );
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
      setQuestions((prev) =>
        prev.map((q) =>
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
      );
    };
    reader.readAsDataURL(file);
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
              <div className="grid gap-2">
                <Label htmlFor="icon">Exam Icon</Label>
                <div className="flex items-center gap-4">
                  {selectedIcon && (
                    <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                      <Image
                        src={selectedIcon}
                        alt="Exam icon"
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-1 top-1 h-6 w-6"
                        onClick={() => setSelectedIcon("")}
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
                onSubjectRemove={handleRemoveAvailableSubject}
                onNewSubject={handleNewSubject}
              />

              <div className="grid gap-2">
                <Label>Topics</Label>
                <div className="flex flex-col gap-2">
                  {topics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {topics.map((topic) => (
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
                            onClick={() => handleRemoveTopic(topic)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Input
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={handleAddTopic}
                    placeholder="Type a topic and press Enter"
                    className="w-full"
                  />
                </div>
              </div>
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
                            updateQuestion(index, "questionImage", null)
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center">
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
                      </div>
                    )}
                  </div>
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
                                  setQuestions((prev) =>
                                    prev.map((q) =>
                                      q.id === question.id
                                        ? {
                                            ...q,
                                            options: q.options.map(
                                              (opt, idx) =>
                                                idx === optionIndex
                                                  ? { ...opt, image: undefined }
                                                  : opt,
                                            ),
                                          }
                                        : q,
                                    ),
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
