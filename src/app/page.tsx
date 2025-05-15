"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { PlusCircle, FileText, FolderPlus, HelpCircle } from "lucide-react";
import { Filters } from "~/components/Filters";
import { FoldersList } from "~/components/FoldersList";
import { ExamCard } from "~/components/ExamCard";
import { FolderDialog } from "~/components/FolderDialog";
import { HomeContextProvider, useExam } from "~/contexts/HomeContext";
import type { Folder } from "~/types";

export default function ExamListPage() {
  return (
    <HomeContextProvider>
      <Content />
    </HomeContextProvider>
  );
}

function Content() {
  const { createFolder, updateExamFolder, filteredExams, deleteExam } =
    useExam();
  const [draggedExamId, setDraggedExamId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  const handleDrop = (folderId: string) => {
    if (!draggedExamId) return;
    updateExamFolder(draggedExamId, folderId);
    setDraggedExamId(null);
  };

  const unassignedExams = filteredExams.filter((e) => !e.folderId);

  return (
    <div className="container mx-auto py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Exams</h1>
          <p className="mt-1 text-muted-foreground">
            Manage and take your created exams
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={createFolder}>
            <FolderPlus className="mr-2 h-4 w-4" /> New Folder
          </Button>
          <Link href="/questions">
            <Button variant="outline">
              <HelpCircle className="mr-2 h-4 w-4" /> Questions
            </Button>
          </Link>
          <Link href="/summary">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" /> Summary
            </Button>
          </Link>
          <Link href="/exams/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Exam
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Exams Section */}
        <div className="flex-1">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {unassignedExams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                onDelete={deleteExam}
                draggable
                onDragStart={() => setDraggedExamId(exam.id)}
              />
            ))}
          </div>
        </div>

        {/* Sidebar: Filters + Folders */}
        <div className="w-64 space-y-4">
          <Filters />
          <h2 className="text-xl font-semibold">Folders</h2>
          <FoldersList
            setSelectedFolder={setSelectedFolder}
            handleDragOver={(e) => e.preventDefault()}
            handleDrop={handleDrop}
          />
        </div>
      </div>

      {/* Folder Dialog */}
      {selectedFolder && (
        <FolderDialog
          folder={selectedFolder}
          onClose={() => setSelectedFolder(null)}
        />
      )}
    </div>
  );
}
