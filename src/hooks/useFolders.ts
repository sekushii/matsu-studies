import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
  serverGetFolders,
  serverCreateFolder,
  serverDeleteFolder,
  serverUpdateFolderIcon,
  serverUpdateFolderName,
} from "~/server/actions";
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
      const result = await serverGetFolders();
      if ("error" in result) {
        setHookState("error");
      } else {
        setFolders(result as Folder[]);
        setHookState("success");
      }
    };

    void fetchFolders();
  }, [isSignedIn]);

  const handleCreateFolder = async (name: string, iconUrl: string) => {
    const newFolder = await serverCreateFolder(name, iconUrl);
    if (!("error" in newFolder)) {
      setFolders([...folders, { ...newFolder, exams: [] } as Folder]);
    }

    return newFolder;
  };

  const handleDeleteFolder = async (folderId: string) => {
    const result = await serverDeleteFolder(folderId);
    if (!("error" in result)) {
      setFolders(folders.filter((f) => f.id !== folderId));
    }
    return result;
  };

  const handleUpdateFolderIcon = async (folderId: string, icon: string) => {
    const result = await serverUpdateFolderIcon(folderId, icon);
    if (!("error" in result)) {
      setFolders(
        folders.map((folder) =>
          folder.id === folderId ? { ...folder, icon } : folder,
        ),
      );
    }
    return result;
  };

  const handleUpdateFolderName = async (folderId: string, newName: string) => {
    const result = await serverUpdateFolderName(folderId, newName);
    if (!("error" in result)) {
      setFolders(
        folders.map((f) => (f.id === folderId ? { ...f, name: newName } : f)),
      );
    }
    return result;
  };

  const handleUpdateFolderSubject = (folderId: string, subject: string) => {
    setFolders((fs) =>
      fs.map((f) =>
        f.id === folderId ? { ...f, subject: subject || undefined } : f,
      ),
    );
  };

  return {
    hookState,
    folders,
    createFolder: handleCreateFolder,
    deleteFolder: handleDeleteFolder,
    updateFolderIcon: handleUpdateFolderIcon,
    renameFolder: handleUpdateFolderName,
    updateFolderSubject: handleUpdateFolderSubject,
  };
}
