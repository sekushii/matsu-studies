import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";
import { ImageUpload } from "~/components/ImageUpload";
import type { Folder } from "~/types";

interface FolderCardProps {
  folder: Folder;
  examCount: number;
  onSelect: (folder: Folder) => void;
  onDelete: (folderId: string) => void;
  onIconUpdate: (
    folderId: string,
    iconUrl: string,
  ) => Promise<{ success: boolean } | { error: string }>;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (folderId: string) => void;
  className?: string;
}

export function FolderCard({
  folder,
  examCount,
  onSelect,
  onDelete,
  onIconUpdate,
  onDragOver,
  onDrop,
  className = "",
}: FolderCardProps) {
  return (
    <div
      className={`relative cursor-pointer rounded-lg border p-2 ${className}`}
      onDragOver={onDragOver}
      onDrop={() => onDrop(folder.id)}
      onClick={() => {
        if (examCount > 0) {
          onSelect(folder);
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
            onDelete(folder.id);
          }}
        >
          <Trash2 className="h-3 w-3 text-red-600" />
        </Button>
      </div>

      <div className="mb-1 text-center text-xs font-medium">{folder.name}</div>
      {folder.subject && (
        <div className="mb-1 text-center text-xs italic text-muted-foreground">
          {folder.subject}
        </div>
      )}

      <div
        className="relative aspect-square w-full overflow-hidden rounded-md bg-cover bg-center"
        style={{
          backgroundImage: folder.iconUrl ? `url(${folder.iconUrl})` : "none",
        }}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          if (!folder.iconUrl) {
            e.stopPropagation();
          }
        }}
      >
        {!folder.iconUrl ? (
          <ImageUpload
            id={`folder-icon-${folder.id}`}
            value={folder.iconUrl ?? null}
            onChange={(iconUrl: string) => onIconUpdate(folder.id, iconUrl)}
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
                void onIconUpdate(folder.id, "");
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
}
