"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { PlusCircle, Pencil } from "lucide-react";
import type { Exam, Question } from "~/types";
import { useSubjects } from "~/hooks/useSubjects";
import { QuestionCreationForm } from "./QuestionCreationForm";
import { ExamDetailsForm } from "./ExamDetailsForm";
import { QuestionList } from "./QuestionList";
import Image from "next/image";
export interface ExamFormProps {
  initialExam?: Partial<Exam>;
  submitLabel?: string;
  onSubmit: (exam: Exam) => void;
  cancelLink?: string;
}

export const ExamForm: React.FC<ExamFormProps> = ({
  initialExam,
  onSubmit,
}) => {
  const router = useRouter();
  const { availableSubjects, addSubject, removeSubject } = useSubjects();
  const [isExamCreated, setIsExamCreated] = useState(!!initialExam);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Initialize state with initialExam or defaults
  const [title, setTitle] = useState(initialExam?.title ?? "");
  const [description, setDescription] = useState(
    initialExam?.description ?? "",
  );
  const [timeLimit, setTimeLimit] = useState(
    (initialExam?.timeLimit ?? 30).toString(),
  );
  const [icon, setIcon] = useState<string>(initialExam?.icon ?? "");
  const [subject, setSubject] = useState(initialExam?.subject ?? "");
  const [questions, setQuestions] = useState<Question[]>(
    initialExam?.questions ?? [],
  );

  // Backup state for editing
  const [backupState, setBackupState] = useState<{
    title: string;
    description: string;
    timeLimit: string;
    icon: string;
    subject: string;
  } | null>(null);

  // Create exam handler - now creates the exam immediately
  const handleCreateExam = () => {
    const exam: Exam = {
      id: initialExam?.id ?? crypto.randomUUID(),
      title,
      description,
      timeLimit: parseInt(timeLimit, 10),
      icon,
      subject,
      topics: [], // Topics are now managed at the question level
      questions: [],
      folderId: initialExam?.folderId,
    };

    // Submit the exam immediately
    onSubmit(exam);
    setIsExamCreated(true);
  };

  // Edit handlers
  const handleStartEdit = () => {
    setBackupState({
      title,
      description,
      timeLimit,
      icon,
      subject,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (backupState) {
      setTitle(backupState.title);
      setDescription(backupState.description);
      setTimeLimit(backupState.timeLimit);
      setIcon(backupState.icon);
      setSubject(backupState.subject);
    }
    setIsEditing(false);
    setBackupState(null);
  };

  // Handle question selection and creation
  const handleQuestionSelect = (
    questionId: string | null,
    isCanceling = false,
  ) => {
    if (isCanceling) {
      // When canceling, reset both states
      setSelectedQuestionId(null);
      setIsCreatingNew(false);
      return;
    }

    if (questionId === null) {
      // Starting a new question
      setSelectedQuestionId(null);
      setIsCreatingNew(true);
    } else {
      // Selecting an existing question
      setSelectedQuestionId(questionId);
      setIsCreatingNew(false);
    }
  };

  // Handle question creation - now adds the question immediately
  const handleQuestionCreate = (newQuestion: Question) => {
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);

    // Update the exam with the new question
    const updatedExam: Exam = {
      id: initialExam?.id ?? crypto.randomUUID(),
      title,
      description,
      timeLimit: parseInt(timeLimit, 10),
      icon,
      subject,
      topics: [], // Topics are now managed at the question level
      questions: updatedQuestions,
      folderId: initialExam?.folderId,
    };

    // Submit the updated exam
    onSubmit(updatedExam);

    setSelectedQuestionId(newQuestion.id);
    setIsCreatingNew(false);
  };

  // Handle question update - now updates the exam immediately
  const handleQuestionUpdate = (updatedQuestion: Question) => {
    const updatedQuestions = questions.map((q) =>
      q.id === updatedQuestion.id ? updatedQuestion : q,
    );
    setQuestions(updatedQuestions);

    // Update the exam with the updated question
    const updatedExam: Exam = {
      id: initialExam?.id ?? crypto.randomUUID(),
      title,
      description,
      timeLimit: parseInt(timeLimit, 10),
      icon,
      subject,
      topics: [], // Topics are now managed at the question level
      questions: updatedQuestions,
      folderId: initialExam?.folderId,
    };

    // Submit the updated exam
    onSubmit(updatedExam);

    setSelectedQuestionId(null);
  };

  // Handle question delete - now updates the exam immediately
  const handleQuestionDelete = (questionId: string) => {
    const updatedQuestions = questions.filter((q) => q.id !== questionId);
    setQuestions(updatedQuestions);

    // Update the exam with the deleted question
    const updatedExam: Exam = {
      id: initialExam?.id ?? crypto.randomUUID(),
      title,
      description,
      timeLimit: parseInt(timeLimit, 10),
      icon,
      subject,
      topics: [], // Topics are now managed at the question level
      questions: updatedQuestions,
      folderId: initialExam?.folderId,
    };

    // Submit the updated exam
    onSubmit(updatedExam);

    if (selectedQuestionId === questionId) {
      const newIndex = Math.max(
        0,
        questions.findIndex((q) => q.id === questionId) - 1,
      );
      setSelectedQuestionId(updatedQuestions[newIndex]?.id ?? null);
    }
  };

  return (
    <div className="flex h-full w-full flex-col pb-20">
      {/* Header with back button */}
      <div className="flex items-center justify-between p-6">
        <h1 className="text-3xl font-bold">
          {initialExam ? "Edit Exam" : "Create New Exam"}
        </h1>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/main")}
            className="cancel-exam-button"
          >
            Go back to main page
          </Button>
        </div>
      </div>

      {!isExamCreated ? (
        // Step 1: Exam Creation Form - only shown for new exams
        <ExamDetailsForm
          exam={{
            id: crypto.randomUUID(),
            title,
            description,
            timeLimit: parseInt(timeLimit, 10),
            icon,
            subject,
            topics: [], // Topics are now managed at the question level
            questions: [],
          }}
          onExamChange={(updatedExam) => {
            setTitle(updatedExam.title ?? "");
            setDescription(updatedExam.description ?? "");
            setTimeLimit((updatedExam.timeLimit ?? 30).toString());
            setIcon(updatedExam.icon ?? "");
            setSubject(updatedExam.subject ?? "");
          }}
          onImageChange={(image) => setIcon(image ?? "")}
        >
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              onClick={handleCreateExam}
              className="create-exam-button-action"
              disabled={!title.trim()}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Create Exam
            </Button>
          </div>
        </ExamDetailsForm>
      ) : (
        // Step 2: Question Creation - shown for both new and existing exams
        <form
          id="exam-form"
          onSubmit={handleCreateExam}
          className="flex h-full flex-col pb-20"
        >
          <div className="flex h-[calc(100vh-8rem)] pb-48">
            {/* Left side - Exam card and questions grid */}
            <div className="flex w-full max-w-2xl flex-col">
              {/* Exam Preview Card */}
              <div className="px-4">
                <Card className="w-full rounded-xl border bg-card text-card-foreground shadow">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{title}</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleStartEdit}
                      className="edit-exam-button"
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Edit Exam
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      {icon && (
                        <div className="h-24 w-24 overflow-hidden rounded-md">
                          <Image
                            src={icon}
                            alt="Exam icon"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {description}
                        </p>
                        <div className="flex gap-2">
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                            {timeLimit} min
                          </span>
                          {subject && (
                            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                              {subject}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Questions Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                <QuestionList
                  questions={questions}
                  onQuestionsChange={setQuestions}
                  onQuestionSelect={(id) => handleQuestionSelect(id, false)}
                  selectedQuestionId={selectedQuestionId}
                  isCreatingNew={isCreatingNew}
                />
              </div>
            </div>

            {/* Right side - Question form */}
            <div className="flex-1 overflow-hidden border-l">
              <QuestionCreationForm
                questions={questions}
                onQuestionsChange={setQuestions}
                selectedQuestionId={selectedQuestionId}
                onQuestionSelect={(id) => handleQuestionSelect(id, true)}
                onQuestionCreate={handleQuestionCreate}
                onQuestionUpdate={handleQuestionUpdate}
                onQuestionDelete={handleQuestionDelete}
                isCreatingNew={isCreatingNew}
                availableSubjects={availableSubjects}
                onSubjectAdd={addSubject}
                onSubjectRemove={removeSubject}
                subjectLimit={10}
              />
            </div>
          </div>
        </form>
      )}

      {/* Edit Mode Overlay */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <ExamDetailsForm
            exam={{
              id: initialExam?.id ?? crypto.randomUUID(),
              title,
              description,
              timeLimit: parseInt(timeLimit, 10),
              icon,
              subject,
              topics: [], // Topics are now managed at the question level
              questions: [],
            }}
            onExamChange={(updatedExam) => {
              setTitle(updatedExam.title ?? "");
              setDescription(updatedExam.description ?? "");
              setTimeLimit((updatedExam.timeLimit ?? 30).toString());
              setIcon(updatedExam.icon ?? "");
              setSubject(updatedExam.subject ?? "");
            }}
            onImageChange={(image) => setIcon(image ?? "")}
            showHeader={false}
            className="max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  // Update the exam with the edited details
                  const updatedExam: Exam = {
                    id: initialExam?.id ?? crypto.randomUUID(),
                    title,
                    description,
                    timeLimit: parseInt(timeLimit, 10),
                    icon,
                    subject,
                    topics: [], // Topics are now managed at the question level
                    questions,
                    folderId: initialExam?.folderId,
                  };
                  onSubmit(updatedExam);
                }}
              >
                Save Changes
              </Button>
            </div>
          </ExamDetailsForm>
        </div>
      )}
    </div>
  );
};
