// ~/components/FolderDialog.tsx
import { Button } from "~/components/ui/button";
import { X, Edit2, Check, XCircle } from "lucide-react";
import type { Folder, Exam } from "~/types";
import { ExamCard } from "./ExamCard";
import { SubjectSelector } from "./SubjectSelector";
import React, { useState, useEffect } from "react";

interface FolderDialogProps {
  folder: Folder;
  exams: Exam[];
  onClose: () => void;
  onDeleteExam: (id: string) => void;
  onRemoveFromFolder: (id: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  availableSubjects: string[];
  onSubjectSelect: (folderId: string, subject: string) => void;
  onSubjectRemove: (subject: string) => void;
  onNewSubject: (subject: string) => void;
}

export function FolderDialog({
  folder,
  exams,
  onClose,
  onDeleteExam,
  onRemoveFromFolder,
  onRenameFolder,
  availableSubjects,
  onSubjectSelect,
  onSubjectRemove,
  onNewSubject,
}: FolderDialogProps) {
  const folderExams = exams.filter((exam) => exam.folderId === folder.id);
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(folder.name);

  useEffect(() => setNameInput(folder.name), [folder.name]);

  const handleSave = () => {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== folder.name) {
      onRenameFolder(folder.id, trimmed);
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl rounded-lg bg-background p-6">
        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex-grow">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  className="border-b bg-transparent text-2xl font-bold focus:outline-none"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                />
                <Button size="icon" variant="ghost" onClick={handleSave}>
                  <Check className="h-5 w-5 text-green-600" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                >
                  <XCircle className="h-5 w-5 text-red-600" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold">{folder.name}</h2>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            {/* Subject selector sits just below the title */}
            <div className="mt-3">
              <SubjectSelector
                selectedSubject={folder.subject ?? ""}
                availableSubjects={availableSubjects}
                onSubjectSelect={(subj) => onSubjectSelect(folder.id, subj)}
                onSubjectRemove={onSubjectRemove}
                onNewSubject={onNewSubject}
                subjectLimit={3}
              />
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* EXAMS GRID */}
        {folderExams.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {folderExams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                onDelete={onDeleteExam}
                onRemoveFromFolder={() => onRemoveFromFolder(exam.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            This folder is empty.
          </p>
        )}
      </div>
    </div>
  );
}
