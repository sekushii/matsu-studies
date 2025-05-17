// ~/components/FolderDialog.tsx
import { Button } from "~/components/ui/button";
import { X, Edit2, Check, XCircle } from "lucide-react";
import type { Folder } from "~/types";
import { ExamCard } from "./ExamCard";
import { SubjectSelector } from "./SubjectSelector";
import React, { useState, useEffect, useCallback } from "react";
import { useExam } from "~/contexts/HomeContext";

interface FolderDialogProps {
  folder: Folder;
  onClose: () => void;
}

export function FolderDialog({
  folder: initialFolder,
  onClose,
}: FolderDialogProps) {
  const {
    filteredExams,
    deleteExam,
    removeExamFromFolder,
    renameFolder,
    availableSubjects,
    updateFolderSubject,
    removeSubject,
    addSubject,
    folders,
  } = useExam();

  // Get the latest folder data from context
  const folder =
    folders.find((f) => f.id === initialFolder.id) ?? initialFolder;
  const folderExams = filteredExams.filter(
    (exam) => exam.folderId === folder.id,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(folder.name);

  useEffect(() => setNameInput(folder.name), [folder.name]);

  const handleSave = useCallback(async () => {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== folder.name) {
      await renameFolder(folder.id, trimmed);
    }
    setIsEditing(false);
  }, [folder.id, folder.name, nameInput, renameFolder]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl rounded-lg bg-background p-6">
        {/* HEADER */}
        <div className="mb-6 flex items-start justify-between">
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
                onSubjectSelect={(subj) => updateFolderSubject(folder.id, subj)}
                onSubjectRemove={removeSubject}
                onNewSubject={addSubject}
                subjectLimit={3}
              />
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {folderExams.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {folderExams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                onDelete={deleteExam}
                onRemoveFromFolder={() => removeExamFromFolder(exam.id)}
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
