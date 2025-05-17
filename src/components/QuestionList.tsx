import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  PlusCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import type { Question } from "~/types";

interface QuestionListProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  onQuestionSelect: (
    questionId: string | null,
    isCreatingNew?: boolean,
  ) => void;
  onQuestionSave?: (questionId: string) => void;
  selectedQuestionId: string | null;
  isCreatingNew: boolean;
  maxQuestions?: number;
}

interface QuestionCardProps {
  question: Question;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  questionNumber: number;
}

const QUESTIONS_PER_PAGE = 9; // 3 columns * 3 rows

export function QuestionList({
  questions,
  onQuestionsChange,
  onQuestionSelect,
  selectedQuestionId,
  isCreatingNew,
  maxQuestions = 100,
}: QuestionListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);

  // Reset current page if it goes out of bounds
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  const handleDeleteQuestion = (questionId: string) => {
    const updatedQuestions = questions.filter((q) => q.id !== questionId);
    onQuestionsChange(updatedQuestions);
  };

  // Calculate which questions to display based on pagination
  const displayQuestions = questions.slice(
    (currentPage - 1) * QUESTIONS_PER_PAGE,
    currentPage * QUESTIONS_PER_PAGE,
  );

  return (
    <div className="flex h-full flex-col">
      {/* Pagination controls */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={() => onQuestionSelect(null, true)}
          disabled={isCreatingNew || questions.length >= maxQuestions}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Question
        </Button>
      </div>

      {/* Questions grid */}
      <div className="grid flex-1 grid-cols-3 gap-4 p-4">
        {displayQuestions.map((question, index) => {
          const questionNumber =
            (currentPage - 1) * QUESTIONS_PER_PAGE + index + 1;
          return (
            <QuestionCard
              key={question.id}
              question={question}
              isSelected={question.id === selectedQuestionId}
              onSelect={() => onQuestionSelect(question.id)}
              onDelete={() => handleDeleteQuestion(question.id)}
              questionNumber={questionNumber}
            />
          );
        })}
        {isCreatingNew && (
          <div className="flex h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Creating new question...
              </span>
            </div>
          </div>
        )}
        {!isCreatingNew && displayQuestions.length === 0 && (
          <div className="col-span-3 flex h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-muted-foreground">
                No questions yet. Click &quot;Add Question&quot; to create one!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  isSelected,
  onSelect,
  onDelete,
  questionNumber,
}: QuestionCardProps) {
  const hasTopics =
    Array.isArray(question.topics) && question.topics.length > 0;

  return (
    <Card
      className={`flex h-[280px] cursor-pointer flex-col transition-colors hover:border-primary/50 ${
        isSelected ? "border-primary/50" : ""
      }`}
      onClick={onSelect}
    >
      <CardHeader className="flex flex-shrink-0 flex-row items-start justify-between space-y-0 pb-2">
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base">Question {questionNumber}</CardTitle>
          {(question.subject ?? hasTopics) && (
            <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
              {question.subject && (
                <span className="rounded-full bg-muted px-2 py-0.5">
                  {question.subject}
                </span>
              )}
              {hasTopics &&
                question.topics?.map((topic, idx) => (
                  <span key={idx} className="rounded-full bg-muted px-2 py-0.5">
                    {topic}
                  </span>
                ))}
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {question.question ?? "No question text"}
              </p>
            </div>
            {question.image && (
              <div className="flex-shrink-0">
                <Image
                  src={question.image}
                  alt="Question"
                  className="h-12 w-12 rounded-md object-cover"
                />
              </div>
            )}
          </div>
          {(question.type === "multiple-choice" ||
            question.type === "checkbox") &&
            question.options.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="font-medium">Options:</span>
                  <span>{question.options.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {question.options.slice(0, 4).map((opt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 rounded-md bg-muted/50 p-1"
                    >
                      {opt.image && (
                        <Image
                          src={opt.image}
                          alt={`Option ${idx + 1}`}
                          className="h-6 w-6 rounded-sm object-cover"
                        />
                      )}
                      <span className="line-clamp-1 text-xs">
                        {opt.text ?? `Option ${idx + 1}`}
                      </span>
                    </div>
                  ))}
                  {question.options.length > 4 && (
                    <div className="flex items-center justify-center rounded-md bg-muted/50 p-1">
                      <span className="text-xs text-muted-foreground">
                        +{question.options.length - 4} more
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
