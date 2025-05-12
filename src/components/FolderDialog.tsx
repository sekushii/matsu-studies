import { Button } from "~/components/ui/button";
import { X } from "lucide-react";
import type { Folder, Exam } from "~/types";
import { ExamCard } from "./ExamCard";

interface FolderDialogProps {
  folder: Folder;
  exams: Exam[];
  onClose: () => void;
  onDeleteExam: (id: string) => void;
  onRemoveFromFolder: (id: string) => void;
}

export function FolderDialog({
  folder,
  exams,
  onClose,
  onDeleteExam,
  onRemoveFromFolder,
}: FolderDialogProps) {
  const folderExams = exams.filter((exam) => exam.folderId === folder.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl rounded-lg bg-background p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{folder.name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {folderExams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onDelete={onDeleteExam}
              onRemoveFromFolder={onRemoveFromFolder}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 