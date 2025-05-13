"use client";

import React, { useState } from "react";
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
import { PlusCircle, Trash2, Save } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "~/components/ui/checkbox";
import type { Question, Exam, QuestionType } from "~/types";
import { SubjectSelector } from "~/components/SubjectSelector";
import { TopicManager } from "~/components/TopicManager";
import { useSubjects } from "~/hooks/useSubjects";
import { ImageUpload } from "~/components/ImageUpload";

export interface ExamFormProps {
  initialExam?: Partial<Exam>;
  submitLabel?: string;
  onSubmit: (exam: Exam) => void;
  cancelLink?: string;
}

export const ExamForm: React.FC<ExamFormProps> = ({
  initialExam,
  submitLabel = "Save",
  onSubmit,
  cancelLink = "/",
}) => {
  const router = useRouter();
  const { availableSubjects, addSubject, removeSubject } = useSubjects();

  // Initialize state with initialExam or defaults
  const [title, setTitle] = useState(initialExam?.title ?? "");
  const [description, setDescription] = useState(
    initialExam?.description ?? "",
  );
  const [timeLimit, setTimeLimit] = useState(
    (initialExam?.timeLimit ?? 30).toString(),
  );
  const maxQuestions = 100;
  const maxOptions = 30;

  const [icon, setIcon] = useState<string>(initialExam?.icon ?? "");
  const [subject, setSubject] = useState(initialExam?.subject ?? "");
  const [topics, setTopics] = useState<string[]>(initialExam?.topics ?? []);
  const [questions, setQuestions] = useState<Question[]>(
    initialExam?.questions?.length
      ? initialExam.questions
      : [
          {
            id: crypto.randomUUID(),
            type: "multiple-choice",
            question: "",
            options: [{ text: "", image: undefined }],
            correctAnswer: "",
          },
        ],
  );

  // Topic handlers
  const handleAddTopic = (topic: string) => {
    if (!topics.includes(topic)) setTopics([...topics, topic]);
  };
  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter((t) => t !== topicToRemove));
  };

  // Question handlers (add, remove, update)
  const addQuestion = () => {
    if (questions.length >= maxQuestions) return;
    setQuestions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "multiple-choice",
        question: "",
        options: [{ text: "", image: undefined }],
        correctAnswer: "",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = <K extends keyof Question>(
    index: number,
    field: K,
    value: Question[K],
  ) => {
    setQuestions((prev) => {
      const newQs = [...prev];
      const q = newQs[index];
      if (!q) return prev;
      // Handle type switch resets
      if (field === "type") {
        const type = value as QuestionType;
        newQs[index] = {
          id: q.id,
          type,
          question: q.question,
          options: type === "text" ? [] : [{ text: "", image: undefined }],
          correctAnswer: type !== "checkbox" ? "" : undefined,
          correctAnswers: type === "checkbox" ? [] : undefined,
        } as Question;
      } else {
        newQs[index] = { ...q, [field]: value } as Question;
      }
      return newQs;
    });
  };

  const addOption = (qIndex: number) => {
    setQuestions((prev) => {
      const qs = [...prev];
      if (!qs[qIndex]) return prev;
      const currentOptions = qs[qIndex].options ?? [];
      if (currentOptions.length >= maxOptions) return prev;

      qs[qIndex] = {
        ...qs[qIndex],
        options: [...currentOptions, { text: "", image: undefined }],
      };
      return qs;
    });
  };

  // Fixing type issue for image upload
  const updateOptionImage = (
    qIndex: number,
    oIndex: number,
    image: string | null,
  ) => {
    setQuestions((prev) => {
      const qs = [...prev];
      if (!qs[qIndex]) return prev;
      const options = [...(qs[qIndex].options ?? [])];
      if (!options[oIndex]) return prev;
      options[oIndex] = { ...options[oIndex], image: image ?? undefined };
      qs[qIndex] = { ...qs[qIndex], options };
      return qs;
    });
  };

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const exam: Exam = {
      id: initialExam?.id ?? crypto.randomUUID(),
      title,
      description,
      timeLimit: parseInt(timeLimit, 10),
      icon,
      subject,
      topics,
      questions,
      folderId: initialExam?.folderId,
    };
    onSubmit(exam);
    router.push(cancelLink);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="exam-form-container flex min-h-screen w-full max-w-4xl flex-col items-center justify-center space-y-6 bg-gray-50"
      style={{}}
    >
      {/* Exam Details */}
      <Card className="exam-details-card w-full max-w-7xl rounded-xl border bg-card text-card-foreground shadow">
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exam-icon">Exam Icon</Label>
            <ImageUpload
              id="exam-icon"
              value={icon}
              onChange={(value) => setIcon(value ?? "")}
              uploadButtonText="Upload exam icon"
            />
          </div>
          <div className="relative grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="pr-16"
            />
            <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {title.length}/100
            </span>
          </div>
          <div className="relative grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              className="pr-16"
            />
            <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {description.length}/500
            </span>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="timeLimit">Time Limit (min)</Label>
            <Input
              id="timeLimit"
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              min={1}
              required
            />
          </div>
          <SubjectSelector
            selectedSubject={subject}
            availableSubjects={availableSubjects}
            onSubjectSelect={setSubject}
            onSubjectRemove={removeSubject}
            onNewSubject={addSubject}
            subjectLimit={4}
          />
          <TopicManager
            topics={topics}
            onAddTopic={handleAddTopic}
            onRemoveTopic={handleRemoveTopic}
            topicLimit={10}
          />
        </CardContent>
      </Card>

      {/* Questions Section */}
      <div className="questions-section w-full max-w-7xl space-y-4 pb-6">
        <h2 className="text-xl font-bold">Questions</h2>
        {questions.map((q, idx) => (
          <Card key={q.id} className="space-y-1">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Question {idx + 1}</CardTitle>
              <div className="pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={questions.length === 1}
                  color="red"
                  onClick={() => removeQuestion(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Type Selector */}
              <div className="space-y-1">
                <Label>Type</Label>
                <Select
                  value={q.type}
                  onValueChange={(val) =>
                    updateQuestion(idx, "type", val as QuestionType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
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
              {/* Question Text & Image */}
              <div className="relative space-y-2">
                <Label>Question Text</Label>
                <Textarea
                  value={q.question}
                  onChange={(e) =>
                    updateQuestion(idx, "question", e.target.value)
                  }
                  maxLength={500}
                  className="pr-16"
                />
                <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                  {q.question.length}/500
                </span>
              </div>
              <div className="space-y-2">
                <Label>Question Image</Label>
                <ImageUpload
                  id={`question-image-${q.id}`}
                  value={q.image}
                  onChange={(val) => updateQuestion(idx, "image", val)}
                  aspectRatio="video"
                  uploadButtonText="Add image"
                />
              </div>
              {/* Options & Correct Answers */}
              {(q.type === "multiple-choice" || q.type === "checkbox") && (
                <div className="space-y-2">
                  <Label className="block pb-3 text-center">Options</Label>
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className="option-container flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-4">
                        <Label
                          htmlFor={`option-text-${q.id}-${oIdx}`}
                          className="flex-shrink-0"
                        >
                          Option {oIdx + 1}
                        </Label>
                        <div className="relative w-full">
                          <Textarea
                            id={`option-text-${q.id}-${oIdx}`}
                            value={opt.text}
                            onChange={(e) => {
                              const newOpts = [...(q.options ?? [])];
                              if (!newOpts[oIdx]) return;
                              newOpts[oIdx].text = e.target.value;
                              updateQuestion(idx, "options", newOpts);
                            }}
                            placeholder="Enter option text"
                            maxLength={300}
                            className="option-textbox h-24 w-full resize-none overflow-auto pr-16"
                          />
                          <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                            {opt.text.length}/300
                          </span>
                        </div>
                        <div className="image-upload-container relative flex flex-col items-center gap-2">
                          <div
                            className="image-upload-box relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-md border"
                            style={{
                              backgroundImage: `url(${opt.image})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          >
                            {!opt.image && (
                              <ImageUpload
                                id={`option-image-${q.id}-${oIdx}`}
                                value={opt.image}
                                onChange={(val) =>
                                  updateOptionImage(idx, oIdx, val)
                                }
                                uploadButtonText=""
                                className="h-full w-full"
                              />
                            )}
                            {opt.image && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() =>
                                  updateOptionImage(idx, oIdx, null)
                                }
                                className="absolute bottom-2 right-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            const newOpts = [...(q.options ?? [])];
                            newOpts.splice(oIdx, 1);
                            updateQuestion(idx, "options", newOpts);
                          }}
                          className="delete-option-button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-center pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addOption(idx)}
                      className="self-center rounded-md border border-gray-300"
                      disabled={q.options.length >= maxOptions}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                    </Button>
                  </div>
                  {q.options.length >= maxOptions && (
                    <p className="text-center text-xs text-red-500">
                      Maximum of {maxOptions} options reached
                    </p>
                  )}
                  {q.type === "multiple-choice" && (
                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      <Select
                        value={q.correctAnswer ?? ""}
                        onValueChange={(val) =>
                          updateQuestion(idx, "correctAnswer", val)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select answer" />
                        </SelectTrigger>
                        <SelectContent>
                          {q.options.map((opt, oIdx) => (
                            <SelectItem
                              key={oIdx}
                              value={opt.text || `Option ${oIdx + 1}`}
                            >
                              {opt.text || `Option ${oIdx + 1}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {q.type === "checkbox" && (
                    <div className="space-y-2">
                      <Label>Correct Answers</Label>
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <Checkbox
                            checked={q.correctAnswers?.includes(opt.text)}
                            onCheckedChange={(checked) => {
                              const curr = q.correctAnswers ?? [];
                              const updated = checked
                                ? [...curr, opt.text]
                                : curr.filter((t) => t !== opt.text);
                              updateQuestion(idx, "correctAnswers", updated);
                            }}
                          />
                          <Label>{opt.text}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={addQuestion}
          disabled={questions.length >= maxQuestions}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Question
        </Button>
      </div>
      {questions.length >= maxQuestions && (
        <p className="text-center text-xs text-red-500">
          Maximum of {maxQuestions} questions reached
        </p>
      )}
      {/* Actions */}
      <div className="action-buttons-container fixed bottom-4 right-4 z-50 flex gap-4">
        <Link href={cancelLink}>
          <Button variant="outline" className="cancel-button-action">
            Cancel
          </Button>
        </Link>
        <Button type="submit" className="create-exam-button-action">
          <Save className="mr-2 h-4 w-4" /> {submitLabel}
        </Button>
      </div>
    </form>
  );
};
