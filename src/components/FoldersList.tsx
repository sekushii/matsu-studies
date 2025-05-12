import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";
import { ImageUpload } from "~/components/ImageUpload";
import type { Folder, Exam } from "~/types";
import React from "react";

interface FoldersListProps {
  folders: Folder[];
  exams: Exam[];
  selectedFolder: Folder | null;
  setSelectedFolder: (folder: Folder | null) => void;
  deleteFolder: (folderId: string) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (folderId: string) => void;
  updateFolderIcon: (folderId: string, icon: string | null) => void;
}

export function FoldersList({
  folders,
  exams,
  setSelectedFolder,
  deleteFolder,
  handleDragOver,
  handleDrop,
  updateFolderIcon,
}: FoldersListProps) {
  return (
    <div className="space-y-4">
      {folders.map((folder) => (
        <div
          key={folder.id}
          className="relative cursor-pointer rounded-lg border p-4"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(folder.id)}
          onClick={() => setSelectedFolder(folder)}
        >
          <div className="absolute right-2 top-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                deleteFolder(folder.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="mb-2 text-center font-medium">{folder.name}</div>
          <div className="relative aspect-square w-full overflow-hidden rounded-md" onClick={(e) => e.stopPropagation()}>
            <ImageUpload
              id={`folder-icon-${folder.id}`}
              value={folder.icon}
              onChange={(icon) => updateFolderIcon(folder.id, icon)}
              uploadButtonText="Upload folder icon"
            />
          </div>
          <div className="mt-2 text-center text-sm text-muted-foreground">
            {exams.filter((exam) => exam.folderId === folder.id).length} exams
          </div>
        </div>
      ))}
    </div>
  );
} 