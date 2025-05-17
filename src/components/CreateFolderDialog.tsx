import { Button } from "~/components/ui/button";
import { X } from "lucide-react";
import { useState, useCallback } from "react";
import { Input } from "~/components/ui/input";
import type { Folder } from "~/types";

interface CreateFolderDialogProps {
  onClose: () => void;
  onCreate: (
    name: string,
    icon: string,
  ) => Promise<
    | Folder
    | {
        error: string;
      }
  >;
}

export function CreateFolderDialog({
  onClose,
  onCreate,
}: CreateFolderDialogProps) {
  const [name, setName] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (name.trim()) {
        await onCreate(name.trim(), "");
        onClose();
      }
    },
    [name, onCreate, onClose],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-background p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create New Folder</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="folder-name"
              className="mb-2 block text-sm font-medium"
            >
              Folder Name
            </label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
