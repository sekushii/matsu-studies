"use client";

import { ExamForm } from "~/components/ExamForm";
import type { Exam } from "~/types";

export default function CreateExamPage() {
  const handleCreate = (exam: Exam) => {
    // persist exam to localStorage or API
    const saved = JSON.parse(localStorage.getItem("exams") ?? "[]") as Exam[];
    saved.push(exam);
    localStorage.setItem("exams", JSON.stringify(saved));
    alert("Created!");
  };

  return (
    <div className="create-exam-container flex min-h-screen flex-col items-center justify-center">
      <h1 className="pb-6 pt-6 text-3xl font-bold">Create New Exam</h1>
      <ExamForm
        submitLabel="Create Exam"
        onSubmit={handleCreate}
        cancelLink="/main"
      />
    </div>
  );
}
