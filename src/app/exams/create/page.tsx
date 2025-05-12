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
    <div className="create-exam-container flex min-h-screen flex-col items-center">
      <h1 className="text-3xl font-bold">Create New Exam</h1>
      <div className="w-full max-w-7xl">
        <ExamForm
          submitLabel="Create Exam"
          onSubmit={handleCreate}
          cancelLink="/"
        />
      </div>
    </div>
  );
}
