import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { getFolders } from "~/server/actions";
import type { Folder } from "~/types";

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [hookState, setHookState] = useState<"loading" | "error" | "success">(
    "loading",
  );
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) return;

    const fetchFolders = async () => {
      const result = await getFolders();
      if ("error" in result) {
        setHookState("error");
      } else {
        setFolders(result as Folder[]);
        setHookState("success");
      }
    };

    void fetchFolders();
  }, [isSignedIn]);

  const createFolder = () => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name: `New Folder ${folders.length + 1}`,
      exams: [],
    };
    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    localStorage.setItem("folders", JSON.stringify(updatedFolders));
  };

  const deleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter((f) => f.id !== folderId);
    setFolders(updatedFolders);
    localStorage.setItem("folders", JSON.stringify(updatedFolders));
  };

  const updateFolderIcon = (folderId: string, icon: string | null) => {
    const updatedFolders = folders.map((folder) =>
      folder.id === folderId ? ({ ...folder, icon } as Folder) : folder,
    );
    setFolders(updatedFolders);
    localStorage.setItem("folders", JSON.stringify(updatedFolders));
  };

  const renameFolder = (folderId: string, newName: string) => {
    const updated = folders.map((f) =>
      f.id === folderId ? { ...f, name: newName } : f,
    );
    setFolders(updated);
    localStorage.setItem("folders", JSON.stringify(updated));
  };

  const updateFolderSubject = (folderId: string, subject: string) => {
    setFolders((fs) =>
      fs.map((f) =>
        f.id === folderId ? { ...f, subject: subject || undefined } : f,
      ),
    );
  };

  return {
    hookState,
    folders,
    createFolder,
    deleteFolder,
    updateFolderIcon,
    renameFolder,
    updateFolderSubject,
  };
}
