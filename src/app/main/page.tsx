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
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CreateFolderDialog } from "~/components/CreateFolderDialog";

export default function ExamListPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <HomeContextProvider>
      <div className="fixed h-full w-full overflow-hidden">
        <Content />
      </div>
    </HomeContextProvider>
  );
}

function Content() {
  const { createFolder, updateExamFolder, filteredExams, deleteExam } =
    useExam();
  const [draggedExamId, setDraggedExamId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

  const handleDrop = (folderId: string) => {
    if (!draggedExamId) return;
    updateExamFolder(draggedExamId, folderId);
    setDraggedExamId(null);
  };

  const unassignedExams = filteredExams.filter((e) => !e.folderId);

  return (
    <div className="no-scroll flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-none bg-background">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Exams</h1>
              <p className="mt-1 text-muted-foreground">
                Manage and take your created exams
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateFolderOpen(true)}
              >
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
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto h-full p-4">
          <div className="grid h-full grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Exams Section */}
            <div className="h-full lg:col-span-3">
              <div
                className="overflow-y-auto pr-8"
                style={{ height: "calc(100vh - 200px)" }}
              >
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
            </div>

            {/* Sidebar: Filters + Folders */}
            <div className="flex h-full flex-col">
              <div className="flex-none">
                <Filters />
              </div>
              <div className="mt-4">
                <h2 className="mb-4 text-xl font-semibold">Folders</h2>
                <div>
                  <FoldersList
                    setSelectedFolder={setSelectedFolder}
                    handleDragOver={(e) => e.preventDefault()}
                    handleDrop={handleDrop}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Folder Dialog */}
      {selectedFolder && (
        <FolderDialog
          folder={selectedFolder}
          onClose={() => setSelectedFolder(null)}
        />
      )}

      {/* Create Folder Dialog */}
      {isCreateFolderOpen && (
        <CreateFolderDialog
          onClose={() => setIsCreateFolderOpen(false)}
          onCreate={createFolder}
        />
      )}
    </div>
  );
}
