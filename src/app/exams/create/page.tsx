"use client";

import { ExamForm } from "~/components/ExamForm";
import type { Exam } from "~/types";
import { serverCreateExam } from "~/server/actions";
import { useCallback } from "react";

export default function CreateExamPage() {
  const handleCreate = useCallback(async (exam: Exam) => {
    const result = await serverCreateExam({
      title: exam.title,
      description: exam.description,
      timeLimit: exam.timeLimit,
      iconUrl: exam.icon,
      folderId: exam.folderId,
    });

    if ("error" in result) {
      alert("Failed to create exam: " + result.error);
    } else {
      alert("Created!");
    }
  }, []);

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
