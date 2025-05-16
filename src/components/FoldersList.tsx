import { Button } from "~/components/ui/button";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageUpload } from "~/components/ImageUpload";
import type { Folder } from "~/types";
import React, { useState } from "react";
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

  const totalPages = Math.ceil(folders.length / foldersPerPage);
  const startIndex = (currentPage - 1) * foldersPerPage;
  const endIndex = startIndex + foldersPerPage;
  const currentFolders = folders.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col">
      {totalPages > 1 && (
        <div className="mb-4 flex-none">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                ),
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {currentFolders.map((folder) => {
          const examCount = filteredExams.filter(
            (e) => e.folderId === folder.id,
          ).length;
          return (
            <div
              key={folder.id}
              className="relative cursor-pointer rounded-lg border p-2"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(folder.id)}
              onClick={() => {
                if (examCount > 0) {
                  setSelectedFolder(folder);
                } else {
                  alert("This folder is empty. Add an exam to access it.");
                }
              }}
            >
              {/* Folder delete button */}
              <div className="absolute right-1 top-1 z-20">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 rounded-full bg-white p-0 shadow"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    deleteFolder(folder.id);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-red-600" />
                </Button>
              </div>

              <div className="mb-1 text-center text-xs font-medium">
                {folder.name}
              </div>
              {folder.subject && (
                <div className="mb-1 text-center text-xs italic text-muted-foreground">
                  {folder.subject}
                </div>
              )}

              <div
                className="relative aspect-square w-full overflow-hidden rounded-md bg-cover bg-center"
                style={{
                  backgroundImage: folder.icon ? `url(${folder.icon})` : "none",
                }}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  if (!folder.icon) {
                    e.stopPropagation();
                  }
                }}
              >
                {!folder.icon ? (
                  <ImageUpload
                    id={`folder-icon-${folder.id}`}
                    value={folder.icon ?? null}
                    onChange={(icon: string | null) =>
                      updateFolderIcon(folder.id, icon)
                    }
                    uploadButtonText="Upload Icon"
                    className="absolute inset-0 h-full w-full cursor-pointer"
                  />
                ) : (
                  <div className="absolute bottom-1 right-1 z-30">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full bg-white p-1 shadow"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        updateFolderIcon(folder.id, null);
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-1 text-center text-xs text-muted-foreground">
                {examCount} exam{examCount !== 1 && "s"}
              </div>

              {examCount === 0 && (
                <div className="mt-1 text-center text-xs text-muted-foreground">
                  Drag and drop an exam here
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
