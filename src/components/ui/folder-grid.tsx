import type { Folder, Exam } from "~/types";
import { FolderCard } from "./folder-card";
import { useMemo } from "react";

interface FolderGridProps {
  folders: Folder[];
  exams: Exam[];
  onFolderSelect: (folder: Folder) => void;
  onFolderDelete: (folderId: string) => void;
  onFolderIconUpdate: (
    folderId: string,
    iconUrl: string,
  ) => Promise<{ success: boolean } | { error: string }>;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (folderId: string) => void;
  className?: string;
}

export function FolderGrid({
  folders,
  exams,
  onFolderSelect,
  onFolderDelete,
  onFolderIconUpdate,
  onDragOver,
  onDrop,
  className = "",
}: FolderGridProps) {
  // Memoize the exam counts for each folder
  const folderExamCounts = useMemo(() => {
    const counts = new Map<string, number>();
    exams.forEach((exam) => {
      if (exam.folderId) {
        counts.set(exam.folderId, (counts.get(exam.folderId) ?? 0) + 1);
      }
    });
    return counts;
  }, [exams]);

  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {folders.map((folder) => (
        <FolderCard
          key={folder.id}
          folder={folder}
          examCount={folderExamCounts.get(folder.id) ?? 0}
          onSelect={onFolderSelect}
          onDelete={onFolderDelete}
          onIconUpdate={onFolderIconUpdate}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
}
