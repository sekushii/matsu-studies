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
  createFolder: () => void;
  deleteFolder: (id: string) => void;
  updateFolderIcon: (id: string, icon: string | null) => void;
  renameFolder: (id: string, name: string) => void;
  updateFolderSubject: (id: string, subject: string) => void;

  // Exams
  filteredExams: Exam[];
  availableTopics: string[];
  selectedSubject: string;
  setSelectedSubject: (subject: string | null) => void;
  selectedTopics: string[];
  setSelectedTopics: (topics: string[]) => void;
  addExam: (exam: Exam) => void;
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
    addExam,
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
    addExam,
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
