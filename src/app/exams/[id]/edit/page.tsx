"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Exam } from "~/types";
import { ExamForm } from "~/components/ExamForm";

export default function EditExamPage() {
  const { id } = useParams();
  const [initial, setInitial] = useState<Exam | null>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("exams") ?? "[]") as Exam[];
    const found = saved.find((e) => e.id === id) ?? null;
    setInitial(found);
  }, [id]);

  const handleUpdate = (exam: Exam) => {
    const saved = JSON.parse(localStorage.getItem("exams") ?? "[]") as Exam[];
    const updated = saved.map((e) => (e.id === exam.id ? exam : e));
    localStorage.setItem("exams", JSON.stringify(updated));
  };

  if (!initial) return <p>Loading…</p>;

  return (
    <div className="edit-exam-container flex min-h-screen flex-col items-center justify-center">
      <h1 className="pb-6 pt-6 text-3xl font-bold">{initial.title}</h1>
      <ExamForm
        initialExam={initial}
        submitLabel="Save Changes"
        onSubmit={handleUpdate}
        cancelLink="/"
      />
    </div>
  );
}
