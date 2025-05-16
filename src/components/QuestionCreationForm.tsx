import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { PlusCircle, Trash2 } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import type { Question, QuestionType } from "~/types";
import { ImageUpload } from "~/components/ImageUpload";
import { SubjectSelector } from "~/components/SubjectSelector";
import { TopicManager } from "~/components/TopicManager";

interface QuestionCreationFormProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  maxQuestions?: number;
  maxOptions?: number;
  selectedQuestionId: string | null;
  onQuestionSelect: (questionId: string | null) => void;
  onQuestionCreate: (question: Question) => void;
  onQuestionUpdate: (question: Question) => void;
  onQuestionDelete: (questionId: string) => void;
  isCreatingNew: boolean;
  availableSubjects: string[];
  onSubjectAdd: (subject: string) => void;
  onSubjectRemove: (subject: string) => void;
  subjectLimit?: number;
}

export function QuestionCreationForm({
  questions,
  maxQuestions = 100,
  maxOptions = 30,
  selectedQuestionId,
  onQuestionSelect,
  onQuestionCreate,
  onQuestionUpdate,
  onQuestionDelete,
  isCreatingNew,
  availableSubjects,
  onSubjectAdd,
  onSubjectRemove,
  subjectLimit = 10,
}: QuestionCreationFormProps) {
  const [newQuestion, setNewQuestion] = useState<Question>({
    id: crypto.randomUUID(),
    type: "multiple-choice" as QuestionType,
    question: "",
    options: [],
    correctAnswer: "",
  });

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const currentQuestion = questions.find((q) => q.id === selectedQuestionId);

  // Reset states when selection changes
  React.useEffect(() => {
    if (isCreatingNew) {
      setNewQuestion({
        id: crypto.randomUUID(),
        type: "multiple-choice" as QuestionType,
        question: "",
        options: [],
        correctAnswer: "",
      });
      setEditingQuestion(null);
    } else if (currentQuestion) {
      setEditingQuestion({ ...currentQuestion });
    } else {
      setEditingQuestion(null);
    }
  }, [isCreatingNew, currentQuestion]);

  // Show empty state when no question is selected and not creating new
  if (!isCreatingNew && !currentQuestion) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
        <h2 className="text-xl font-bold">Questions</h2>
        <p className="text-sm text-muted-foreground">
          No questions yet. Click &quot;New Question&quot; to add one.
        </p>
      </div>
    );
  }

  // Show empty state when editingQuestion is null (should not happen, but just in case)
  if (!isCreatingNew && !editingQuestion) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
        <h2 className="text-xl font-bold">Error</h2>
        <p className="text-sm text-muted-foreground">
          Something went wrong. Please try selecting the question again.
        </p>
      </div>
    );
  }

  const handleCreateQuestion = () => {
    if (!newQuestion.question.trim()) {
      return;
    }
    onQuestionCreate(newQuestion);
  };

  const handleCancel = () => {
    onQuestionSelect(null);
  };

  const handleSaveEdits = () => {
    if (editingQuestion) {
      onQuestionUpdate(editingQuestion);
      onQuestionSelect(null);
    }
  };

  const updateQuestion = <K extends keyof Question>(
    field: K,
    value: Question[K],
  ) => {
    if (isCreatingNew) {
      if (field === "type") {
        const type = value as QuestionType;
        setNewQuestion({
          ...newQuestion,
          type,
          options: [],
          correctAnswer: type !== "checkbox" ? "" : undefined,
          correctAnswers: type === "checkbox" ? [] : undefined,
        } as Question);
      } else {
        setNewQuestion({ ...newQuestion, [field]: value } as Question);
      }
    } else if (editingQuestion) {
      if (field === "type") {
        const type = value as QuestionType;
        setEditingQuestion({
          ...editingQuestion,
          type,
          options: [],
          correctAnswer: type !== "checkbox" ? "" : undefined,
          correctAnswers: type === "checkbox" ? [] : undefined,
        } as Question);
      } else {
        setEditingQuestion({ ...editingQuestion, [field]: value } as Question);
      }
    }
  };

  const addOption = () => {
    if (isCreatingNew) {
      const currentOptions = newQuestion.options ?? [];
      if (currentOptions.length >= maxOptions) return;
      setNewQuestion({
        ...newQuestion,
        options: [...currentOptions, { text: "", image: undefined }],
      });
    } else if (editingQuestion) {
      const currentOptions = editingQuestion.options ?? [];
      if (currentOptions.length >= maxOptions) return;
      setEditingQuestion({
        ...editingQuestion,
        options: [...currentOptions, { text: "", image: undefined }],
      });
    }
  };

  const updateOptionImage = (oIndex: number, image: string | null) => {
    if (isCreatingNew) {
      const options = [...(newQuestion.options ?? [])];
      if (!options[oIndex]) return;
      options[oIndex] = { ...options[oIndex], image: image ?? undefined };
      setNewQuestion({ ...newQuestion, options });
    } else if (editingQuestion) {
      const options = [...(editingQuestion.options ?? [])];
      if (!options[oIndex]) return;
      options[oIndex] = { ...options[oIndex], image: image ?? undefined };
      setEditingQuestion({ ...editingQuestion, options });
    }
  };

  const handleSubjectSelect = (subject: string) => {
    updateQuestion("subject", subject);
  };

  const handleTopicAdd = (topic: string) => {
    const currentTopics = displayQuestion.topics ?? [];
    if (!currentTopics.includes(topic)) {
      updateQuestion("topics", [...currentTopics, topic]);
    }
  };

  const handleTopicRemove = (topic: string) => {
    const currentTopics = displayQuestion.topics ?? [];
    updateQuestion(
      "topics",
      currentTopics.filter((t) => t !== topic),
    );
  };

  // Use the appropriate question object based on whether we're creating new or editing existing
  const displayQuestion = isCreatingNew ? newQuestion : editingQuestion!;

  // Early return if we somehow don't have a displayQuestion
  if (!displayQuestion) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <Card className="flex h-full flex-col">
        <CardHeader className="flex flex-shrink-0 items-center justify-between py-3">
          <div className="space-y-0.5">
            <CardTitle className="text-lg">
              {isCreatingNew
                ? "New Question"
                : `Question ${questions.findIndex((q) => q.id === selectedQuestionId) + 1}`}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {displayQuestion.type === "multiple-choice"
                ? "Single Answer"
                : displayQuestion.type === "checkbox"
                  ? "Multiple Answers"
                  : "Text Answer"}
            </p>
          </div>
          {!isCreatingNew && currentQuestion && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={questions.length === 1}
              color="red"
              onClick={() => onQuestionDelete(currentQuestion.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-3">
          <div className="space-y-3">
            {/* Type Selector */}
            <div className="space-y-1">
              <Label className="text-sm">Type</Label>
              <Select
                value={displayQuestion.type}
                onValueChange={(val) =>
                  updateQuestion("type", val as QuestionType)
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Single Answer</SelectItem>
                  <SelectItem value="checkbox">Multiple Answers</SelectItem>
                  <SelectItem value="text">Text Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject Selector */}
            <SubjectSelector
              selectedSubject={displayQuestion.subject ?? ""}
              availableSubjects={availableSubjects}
              onSubjectSelect={handleSubjectSelect}
              onSubjectRemove={onSubjectRemove}
              onNewSubject={onSubjectAdd}
              subjectLimit={subjectLimit}
            />

            {/* Topic Manager */}
            <TopicManager
              topics={displayQuestion.topics ?? []}
              onAddTopic={handleTopicAdd}
              onRemoveTopic={handleTopicRemove}
              topicLimit={10}
              label="Topics"
              placeholder="Type a topic and press Enter"
            />

            {/* Question Text & Image */}
            <div className="space-y-1">
              <Label className="text-sm">Question</Label>
              <div className="flex gap-2">
                <div className="w-[calc(100%-92px)]">
                  <div className="relative inline-block w-full">
                    <Textarea
                      value={displayQuestion.question}
                      onChange={(e) =>
                        updateQuestion("question", e.target.value)
                      }
                      maxLength={500}
                      className="h-[75px] resize-none"
                    />
                    <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                      {displayQuestion.question.length}/500
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <ImageUpload
                    id={`question-image-${displayQuestion.id}`}
                    value={displayQuestion.image}
                    onChange={(val) => updateQuestion("image", val)}
                    uploadButtonText="Add image"
                    className="w-[80px]"
                  />
                </div>
              </div>
            </div>

            {/* Options & Correct Answers */}
            {(displayQuestion.type === "multiple-choice" ||
              displayQuestion.type === "checkbox") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Options</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    disabled={displayQuestion.options.length >= maxOptions}
                    className="h-7"
                  >
                    <PlusCircle className="mr-1 h-3 w-3" /> Add Option
                  </Button>
                </div>

                <div className="space-y-2">
                  {displayQuestion.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-start gap-2">
                      <div className="flex flex-col items-center gap-1">
                        <Label className="text-sm">{oIdx + 1}.</Label>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex gap-2">
                          <div className="w-[calc(100%-140px)] min-w-0">
                            <div className="relative inline-block w-full">
                              <Textarea
                                value={opt.text}
                                onChange={(e) => {
                                  const newOpts = [
                                    ...(displayQuestion.options ?? []),
                                  ];
                                  if (!newOpts[oIdx]) return;
                                  newOpts[oIdx].text = e.target.value;
                                  updateQuestion("options", newOpts);
                                }}
                                placeholder="Enter option text"
                                maxLength={300}
                                className="h-[75px] resize-none"
                              />
                              <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                                {opt.text.length}/300
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-shrink-0 items-center gap-2">
                            <ImageUpload
                              id={`option-image-${displayQuestion.id}-${oIdx}`}
                              value={opt.image}
                              onChange={(val) => updateOptionImage(oIdx, val)}
                              uploadButtonText="Add image"
                              className="w-[80px]"
                            />
                          </div>
                          <div className="flex items-center justify-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                const newOpts = [
                                  ...(displayQuestion.options ?? []),
                                ];
                                newOpts.splice(oIdx, 1);
                                updateQuestion("options", newOpts);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {displayQuestion.options.length >= maxOptions && (
                  <p className="text-center text-xs text-red-500">
                    Maximum of {maxOptions} options reached
                  </p>
                )}

                {displayQuestion.type === "multiple-choice" && (
                  <div className="space-y-1">
                    <Label className="text-sm">Correct Answer</Label>
                    <Select
                      value={displayQuestion.correctAnswer ?? ""}
                      onValueChange={(val) =>
                        updateQuestion("correctAnswer", val)
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select answer" />
                      </SelectTrigger>
                      <SelectContent>
                        {displayQuestion.options.map((opt, oIdx) => (
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

                {displayQuestion.type === "checkbox" && (
                  <div className="space-y-1">
                    <Label className="text-sm">Correct Answers</Label>
                    <div className="space-y-1">
                      {displayQuestion.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <Checkbox
                            checked={displayQuestion.correctAnswers?.includes(
                              opt.text,
                            )}
                            onCheckedChange={(checked) => {
                              const curr = displayQuestion.correctAnswers ?? [];
                              const updated = checked
                                ? [...curr, opt.text]
                                : curr.filter((t) => t !== opt.text);
                              updateQuestion("correctAnswers", updated);
                            }}
                          />
                          <Label className="text-sm">{opt.text}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        {/* Action Buttons*/}
        <div className="flex justify-end gap-2 pb-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="h-8"
          >
            Cancel
          </Button>
          {isCreatingNew ? (
            <Button
              type="button"
              onClick={handleCreateQuestion}
              disabled={!displayQuestion.question.trim()}
              className="h-8"
            >
              Create Question
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSaveEdits}
              disabled={!displayQuestion.question.trim()}
              className="h-8"
            >
              Save edits
            </Button>
          )}
        </div>
      </Card>
      {questions.length >= maxQuestions && (
        <p className="mt-4 text-center text-xs text-red-500">
          Maximum of {maxQuestions} questions reached
        </p>
      )}
    </div>
  );
}
