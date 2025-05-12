import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import React, { type Dispatch, type SetStateAction } from "react";
import type { Exam } from "~/types";
import { Label } from "~/components/ui/label";

interface ExamNotesProps {
  exam: Exam;
  currentQuestionIndex: number;
  setExam: Dispatch<SetStateAction<Exam | null>>;
}

export function ExamNotes({
  exam,
  currentQuestionIndex,
  setExam,
}: ExamNotesProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Notes</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const currentQuestionId = exam.questions[currentQuestionIndex]?.id;
            if (!currentQuestionId) return;

            const updatedQuestions = exam.questions.map((q) => {
              if (q.id === currentQuestionId) {
                return { ...q, notes: "" };
              }
              return q;
            });

            setExam((prev) => {
              if (!prev) return prev;
              return { ...prev, questions: updatedQuestions };
            });

            // Update localStorage
            const savedExams = localStorage.getItem("exams");
            if (savedExams) {
              const exams = JSON.parse(savedExams) as Exam[];
              const updatedExams = exams.map((e) => {
                if (e.id === exam.id) {
                  return { ...e, questions: updatedQuestions };
                }
                return e;
              });
              localStorage.setItem("exams", JSON.stringify(updatedExams));
            }
          }}
        >
          Clear Notes
        </Button>
      </div>
      <Textarea
        value={exam.questions[currentQuestionIndex]?.notes ?? ""}
        onChange={(e) => {
          const currentQuestionId = exam.questions[currentQuestionIndex]?.id;
          if (!currentQuestionId) return;

          const updatedQuestions = exam.questions.map((q) => {
            if (q.id === currentQuestionId) {
              return { ...q, notes: e.target.value };
            }
            return q;
          });

          setExam((prev) => {
            if (!prev) return prev;
            return { ...prev, questions: updatedQuestions };
          });

          // Update localStorage
          const savedExams = localStorage.getItem("exams");
          if (savedExams) {
            const exams = JSON.parse(savedExams) as Exam[];
            const updatedExams = exams.map((e) => {
              if (e.id === exam.id) {
                return { ...e, questions: updatedQuestions };
              }
              return e;
            });
            localStorage.setItem("exams", JSON.stringify(updatedExams));
          }
        }}
        placeholder="Add your notes here..."
        className="min-h-[100px]"
      />
    </div>
  );
}
