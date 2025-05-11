import { useState, useEffect } from "react";
import type { Folder } from "~/types";

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    const savedFolders = localStorage.getItem("folders");
    if (savedFolders) {
      const parsedFolders = JSON.parse(savedFolders) as Folder[];
      setFolders(parsedFolders);
    }
  }, []);

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
      folder.id === folderId ? { ...folder, icon } as Folder : folder
    );
    setFolders(updatedFolders);
    localStorage.setItem("folders", JSON.stringify(updatedFolders));
  };

  return { folders, createFolder, deleteFolder, updateFolderIcon };
} 