import { useState, useEffect } from "react";

export function useSubjects() {
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  useEffect(() => {
    const savedSubjects = localStorage.getItem("exam-subjects");
    if (savedSubjects) {
      try {
        const parsedSubjects = JSON.parse(savedSubjects) as string[];
        setAvailableSubjects(parsedSubjects);
      } catch (error) {
        console.error("Failed to parse subjects from localStorage:", error);
        setAvailableSubjects([]);
      }
    }
  }, []);

  const addSubject = (subject: string) => {
    if (!availableSubjects.includes(subject)) {
      const newSubjects = [...availableSubjects, subject];
      setAvailableSubjects(newSubjects);
      localStorage.setItem("exam-subjects", JSON.stringify(newSubjects));
    }
  };

  const removeSubject = (subject: string) => {
    const newSubjects = availableSubjects.filter((s) => s !== subject);
    setAvailableSubjects(newSubjects);
    localStorage.setItem("exam-subjects", JSON.stringify(newSubjects));
  };

  return {
    availableSubjects,
    addSubject,
    removeSubject,
  };
} 