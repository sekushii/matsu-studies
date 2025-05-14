import { useState, useEffect } from "react";
import type { Exam } from "~/types";

export function useExamListing() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  useEffect(() => {
    // Load exams from localStorage
    const savedExams = localStorage.getItem("exams");

    if (savedExams) {
      const parsedExams = JSON.parse(savedExams) as Exam[];
      setExams(parsedExams);

      // Extract unique topics from all exams
      const topics = new Set<string>();
      parsedExams.forEach((exam) => {
        exam.topics?.forEach((topic) => topics.add(topic));
      });
      setAvailableTopics(Array.from(topics));
    }
  }, []);

  const filteredExams = exams.filter((exam) => {
    const matchesSubject =
      selectedSubject === "all" || exam.subject === selectedSubject;
    const matchesTopics =
      selectedTopics.length === 0 ||
      selectedTopics.every((topic) => exam.topics?.includes(topic));
    return matchesSubject && matchesTopics;
  });

  const deleteExam = (examId: string) => {
    // Remove exam from exams array
    const updatedExams = exams.filter((exam) => exam.id !== examId);
    setExams(updatedExams);
    localStorage.setItem("exams", JSON.stringify(updatedExams));

    // Remove exam answers from localStorage
    localStorage.removeItem(`exam-answers-${examId}`);
  };

  const removeExamFromFolder = (examId: string) => {
    const updatedExams = exams.map((exam) =>
      exam.id === examId ? { ...exam, folderId: undefined } : exam,
    );
    setExams(updatedExams);
    localStorage.setItem("exams", JSON.stringify(updatedExams));
  };

  const updateExamFolder = (examId: string, folderId: string | undefined) => {
    const updatedExams = exams.map((exam) =>
      exam.id === examId ? { ...exam, folderId } : exam,
    );
    setExams(updatedExams);
    localStorage.setItem("exams", JSON.stringify(updatedExams));
  };

  return {
    exams,
    filteredExams,
    availableTopics,
    selectedSubject,
    setSelectedSubject,
    selectedTopics,
    setSelectedTopics,
    deleteExam,
    removeExamFromFolder,
    updateExamFolder,
  };
}
