import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";
import { ImageUpload } from "~/components/ImageUpload";
import type { Folder } from "~/types";
import React from "react";
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

  return (
    <div className="space-y-4">
      {folders.map((folder) => {
        const examCount = filteredExams.filter(
          (e) => e.folderId === folder.id,
        ).length;
        return (
          <div
            key={folder.id}
            className="relative cursor-pointer rounded-lg border p-4"
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
            <div className="absolute right-2 top-2 z-20">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white p-0 shadow"
                onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  await deleteFolder(folder.id);
                }}
              >
                <Trash2 className="h-5 w-5 text-red-600" />
              </Button>
            </div>

            <div className="mb-1 text-center font-medium">{folder.name}</div>
            {folder.subject && (
              <div className="mb-2 text-center text-sm italic text-muted-foreground">
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
                  onChange={async (icon: string | null) =>
                    await updateFolderIcon(folder.id, icon ?? "")
                  }
                  uploadButtonText="Upload Icon"
                  className="absolute inset-0 h-full w-full cursor-pointer"
                />
              ) : (
                <div className="absolute bottom-2 right-2 z-30">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white p-1 shadow"
                    onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      await updateFolderIcon(folder.id, "");
                    }}
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-2 text-center text-sm text-muted-foreground">
              {examCount} exam{examCount !== 1 && "s"}
            </div>

            {examCount === 0 && (
              <div className="mt-1 text-center text-xs text-muted-foreground">
                Drag and drop an exam here to be able to access the folder
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
