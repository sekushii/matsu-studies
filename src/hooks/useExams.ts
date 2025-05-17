import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import type { Exam } from "~/types";
import {
  serverGetExams,
  serverDeleteExam,
  serverUpdateExamFolder,
  serverCreateExam,
} from "~/server/actions";

export function useExamListing() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [hookState, setHookState] = useState<"loading" | "error" | "success">(
    "loading",
  );
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) return;

    const fetchExams = async () => {
      const result = await serverGetExams();
      if ("error" in result) {
        setHookState("error");
      } else {
        setExams(result);

        // Extract unique topics from all exams
        const topics = new Set<string>();
        result.forEach((exam) => {
          exam.topics?.forEach((topic) => topics.add(topic));
        });
        setAvailableTopics(Array.from(topics));
        setHookState("success");
      }
    };

    void fetchExams();
  }, [isSignedIn]);

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesSubject =
        selectedSubject === "all" || exam.subject === selectedSubject;
      const matchesTopics =
        selectedTopics.length === 0 ||
        selectedTopics.every((topic) => exam.topics?.includes(topic));
      return matchesSubject && matchesTopics;
    });
  }, [exams, selectedSubject, selectedTopics]);

  const addExam = useCallback(
    async (exam: Exam) => {
      const result = await serverCreateExam(exam);
      if (!("error" in result)) {
        const updatedExams = [...exams, { ...exam, id: result.id }];
        setExams(updatedExams);
      }

      // Update available topics
      const topics = new Set(availableTopics);
      exam.topics?.forEach((topic) => topics.add(topic));
      setAvailableTopics(Array.from(topics));
    },
    [exams, availableTopics],
  );

  const deleteExam = useCallback(
    async (examId: string) => {
      const result = await serverDeleteExam(examId);
      if (!("error" in result)) {
        setExams(exams.filter((exam) => exam.id !== examId));
      }
      return result;
    },
    [exams],
  );

  const removeExamFromFolder = useCallback(
    async (examId: string) => {
      const result = await serverUpdateExamFolder(examId, undefined);
      if (!("error" in result)) {
        setExams(
          exams.map((exam) =>
            exam.id === examId ? { ...exam, folderId: undefined } : exam,
          ),
        );
      }
      return result;
    },
    [exams],
  );

  const updateExamFolder = useCallback(
    async (examId: string, folderId: string) => {
      const result = await serverUpdateExamFolder(examId, folderId);
      if (!("error" in result)) {
        setExams(
          exams.map((exam) =>
            exam.id === examId ? { ...exam, folderId } : exam,
          ),
        );
      }
      return result;
    },
    [exams],
  );

  return {
    exams,
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
    hookState,
  };
}
