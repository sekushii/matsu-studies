import { Pagination } from "~/components/ui/pagination";
import { FolderGrid } from "~/components/ui/folder-grid";
import type { Folder } from "~/types";
import React, { useState, useMemo } from "react";
import { useExam } from "~/contexts/HomeContext";

interface FoldersListProps {
  setSelectedFolder: (folder: Folder | null) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (folderId: string) => void;
}

export function FoldersList({
  setSelectedFolder,
  handleDragOver,
  handleDrop,
}: FoldersListProps) {
  const { folders, filteredExams, deleteFolder, updateFolderIcon } = useExam();
  const [currentPage, setCurrentPage] = useState(1);
  const foldersPerPage = 6;

  const { totalPages, currentFolders } = useMemo(() => {
    const totalPages = Math.ceil(folders.length / foldersPerPage);
    const startIndex = (currentPage - 1) * foldersPerPage;
    const endIndex = startIndex + foldersPerPage;
    const currentFolders = folders.slice(startIndex, endIndex);
    return { totalPages, currentFolders };
  }, [folders, currentPage, foldersPerPage]);

  return (
    <div className="flex flex-col">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="mb-4"
      />
      <FolderGrid
        folders={currentFolders}
        exams={filteredExams}
        onFolderSelect={setSelectedFolder}
        onFolderDelete={deleteFolder}
        onFolderIconUpdate={updateFolderIcon}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      />
    </div>
  );
}
