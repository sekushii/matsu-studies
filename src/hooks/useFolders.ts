import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { FOLDER_ACTIONS } from "~/server/actions";
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
      const result = await FOLDER_ACTIONS.getFolders();
      if ("error" in result) {
        setHookState("error");
      } else {
        setFolders(result as Folder[]);
        setHookState("success");
      }
    };

    void fetchFolders();
  }, [isSignedIn]);

  const createFolder = async (name: string, iconUrl: string) => {
    const newFolder = await FOLDER_ACTIONS.createFolder(name, iconUrl);
    if (!("error" in newFolder)) {
      setFolders([...folders, { ...newFolder, exams: [] } as Folder]);
    }

    return newFolder;
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
