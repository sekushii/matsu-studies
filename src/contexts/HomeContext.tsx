"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useFolders } from "~/hooks/useFolders";
import { useExamListing } from "~/hooks/useExams";
import { useSubjects } from "~/hooks/useSubjects";
import type { Exam, Folder } from "~/types";

interface HomeContextType {
  // Folders
  folders: Folder[];
  createFolder: (
    name: string,
    iconUrl: string,
  ) => Promise<Folder | { error: string }>;
  deleteFolder: (
    id: string,
  ) => Promise<{ error: string } | { success: boolean }>;
  updateFolderIcon: (
    id: string,
    icon: string,
  ) => Promise<
    | {
        id: string;
        name: string;
        icon: string | undefined;
      }
    | {
        error: string;
      }
  >;
  renameFolder: (
    id: string,
    name: string,
  ) => Promise<
    | {
        id: string;
        name: string;
        icon: string | undefined;
      }
    | {
        error: string;
      }
  >;
  updateFolderSubject: (id: string, subject: string) => void;

  // Exams
  filteredExams: Exam[];
  availableTopics: string[];
  selectedSubject: string;
  setSelectedSubject: (subject: string | null) => void;
  selectedTopics: string[];
  setSelectedTopics: (topics: string[]) => void;
  deleteExam: (id: string) => void;
  removeExamFromFolder: (examId: string) => void;
  updateExamFolder: (examId: string, folderId: string) => void;

  // Subjects
  availableSubjects: string[];
  addSubject: (subject: string) => void;
  removeSubject: (subject: string) => void;
}

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export function HomeContextProvider({ children }: { children: ReactNode }) {
  const {
    folders,
    createFolder,
    deleteFolder,
    updateFolderIcon,
    renameFolder,
    updateFolderSubject,
  } = useFolders();

  const {
    filteredExams,
    availableTopics,
    selectedSubject,
    setSelectedSubject: setSelectedSubjectState,
    selectedTopics,
    setSelectedTopics,
    deleteExam,
    removeExamFromFolder,
    updateExamFolder,
  } = useExamListing();

  const { availableSubjects, addSubject, removeSubject } = useSubjects();

  // Wrap setSelectedSubject to handle null values
  const setSelectedSubject = (subject: string | null) => {
    setSelectedSubjectState(subject ?? "all");
  };

  const value = {
    // Folders
    folders,
    createFolder,
    deleteFolder,
    updateFolderIcon,
    renameFolder,
    updateFolderSubject,

    // Exams
    filteredExams,
    availableTopics,
    selectedSubject,
    setSelectedSubject,
    selectedTopics,
    setSelectedTopics,
    deleteExam,
    removeExamFromFolder,
    updateExamFolder,

    // Subjects
    availableSubjects,
    addSubject,
    removeSubject,
  };

  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
}

export function useExam() {
  const context = useContext(HomeContext);
  if (context === undefined) {
    throw new Error("useExam must be used within a HomeContextProvider");
  }
  return context;
}
