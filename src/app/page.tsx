"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { PlusCircle, FileText, FolderPlus, HelpCircle } from "lucide-react";
import { FoldersList } from "~/components/FoldersList";
import { ExamCard } from "~/components/ExamCard";
import { Filters } from "~/components/Filters";
import { FolderDialog } from "~/components/FolderDialog";
import { useExam } from "~/contexts/HomeContext";

export default function ExamListPage() {
  const {
    folders,
    createFolder,
    deleteFolder,
    updateFolderIcon,
    renameFolder,
    updateFolderSubject,
    filteredExams,
    availableTopics,
    selectedSubject,
    setSelectedSubject,
    selectedTopics,
    setSelectedTopics,
    deleteExam,
    removeExamFromFolder,
    updateExamFolder,
    availableSubjects,
    addSubject,
    removeSubject,
  } = useExam();

  const [draggedExamId, setDraggedExamId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const selectedFolder = folders.find((f) => f.id === selectedFolderId) ?? null;

  const handleDragStart = (examId: string) => setDraggedExamId(examId);
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) =>
    e.preventDefault();
  const handleDrop = (folderId: string) => {
    if (!draggedExamId) return;
    updateExamFolder(draggedExamId, folderId);
    setDraggedExamId(null);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Exams</h1>
          <p className="mt-1 text-muted-foreground">
            Manage and take your created exams
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={createFolder}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <Link href="/questions">
            <Button variant="outline">
              <HelpCircle className="mr-2 h-4 w-4" />
              Questions
            </Button>
          </Link>
          <Link href="/summary">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Summary
            </Button>
          </Link>
          <Link href="/exams/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Exam
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Exams Section */}
        <div className="flex-1">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExams
              .filter((exam) => !exam.folderId)
              .map((exam) => (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  onDelete={deleteExam}
                  draggable
                  onDragStart={() => handleDragStart(exam.id)}
                />
              ))}
          </div>
        </div>

        {/* Folders Section */}
        <div className="w-64 space-y-4">
          <Filters
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            selectedTopics={selectedTopics}
            setSelectedTopics={setSelectedTopics}
            availableSubjects={availableSubjects}
            availableTopics={availableTopics}
          />

          <h2 className="text-xl font-semibold">Folders</h2>
          <FoldersList
            folders={folders}
            exams={filteredExams}
            setSelectedFolder={(folder) =>
              setSelectedFolderId(folder ? folder.id : null)
            }
            deleteFolder={deleteFolder}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            updateFolderIcon={updateFolderIcon}
          />
        </div>
      </div>

      {/* Folder Content Dialog */}
      {selectedFolder && (
        <FolderDialog
          folder={selectedFolder}
          exams={filteredExams}
          onClose={() => setSelectedFolderId(null)}
          onDeleteExam={deleteExam}
          onRemoveFromFolder={removeExamFromFolder}
          onRenameFolder={renameFolder}
          availableSubjects={availableSubjects}
          onSubjectSelect={updateFolderSubject}
          onNewSubject={addSubject}
          onSubjectRemove={removeSubject}
        />
      )}
    </div>
  );
}
