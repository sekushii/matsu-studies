"use client";

import { ExamForm } from "~/components/ExamForm";
import type { Exam } from "~/types";
import { useRouter } from "next/navigation";
import { useExam, HomeContextProvider } from "~/contexts/HomeContext";
import { useCallback } from "react";

function CreateExamPageContent() {
  const router = useRouter();
  const { addExam } = useExam();

  const handleCreate = useCallback(
    async (exam: Exam) => {
      try {
        // Add exam to the context
        void (await addExam(exam));

        // Navigate to the exam edit page
        router.push(`/exams/${exam.id}/edit`);
      } catch (err) {
        console.error("Error creating exam:", err);
      }
    },
    [addExam, router],
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col">
      <div className="flex-1 overflow-hidden">
        <ExamForm
          submitLabel="Create Exam"
          onSubmit={handleCreate}
          cancelLink="/main"
        />
      </div>
    </div>
  );
}

export default function CreateExamPage() {
  return (
    <HomeContextProvider>
      <CreateExamPageContent />
    </HomeContextProvider>
  );
}
