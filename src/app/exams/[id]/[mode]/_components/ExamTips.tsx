import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { X } from "lucide-react";
import type { Exam } from "~/types";
import { useState, type Dispatch, type SetStateAction } from "react";
import { Label } from "~/components/ui/label";

interface ExamTipsProps {
  exam: Exam;
  currentQuestionIndex: number;
  setExam: Dispatch<SetStateAction<Exam | null>>;
  onToggle: Dispatch<SetStateAction<boolean>>;
  isVisible: boolean;
}

export function ExamTips({
  exam,
  currentQuestionIndex,
  setExam,
  onToggle,
  isVisible,
}: ExamTipsProps) {
  const [newTip, setNewTip] = useState("");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label>Tips</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(!isVisible)}
          >
            {isVisible ? "Hide Tips" : "Show Tips"}
          </Button>
        </div>
        {isVisible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const currentQuestionId =
                exam.questions[currentQuestionIndex]?.id;
              if (!currentQuestionId) return;

              const updatedQuestions = exam.questions.map((q) => {
                if (q.id === currentQuestionId) {
                  return { ...q, tips: [] };
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
            Clear Tips
          </Button>
        )}
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          {exam.questions[currentQuestionIndex]?.tips?.map((tip, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-md bg-muted p-2"
            >
              <span className="flex-1">{tip}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const currentQuestionId =
                    exam.questions[currentQuestionIndex]?.id;
                  if (!currentQuestionId) return;

                  const updatedQuestions = exam.questions.map((q) => {
                    if (q.id === currentQuestionId) {
                      return {
                        ...q,
                        tips: q.tips?.filter((_, i) => i !== index) ?? [],
                      };
                    }
                    return q;
                  });

                  setExam((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      questions: updatedQuestions,
                    };
                  });

                  // Update localStorage
                  const savedExams = localStorage.getItem("exams");
                  if (savedExams) {
                    const exams = JSON.parse(savedExams) as Exam[];
                    const updatedExams = exams.map((e) => {
                      if (e.id === exam.id) {
                        return {
                          ...e,
                          questions: updatedQuestions,
                        };
                      }
                      return e;
                    });
                    localStorage.setItem("exams", JSON.stringify(updatedExams));
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newTip}
            onChange={(e) => setNewTip(e.target.value)}
            placeholder="Add a new tip..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && newTip.trim()) {
                const currentQuestionId =
                  exam.questions[currentQuestionIndex]?.id;
                if (!currentQuestionId) return;

                const updatedQuestions = exam.questions.map((q) => {
                  if (q.id === currentQuestionId) {
                    return {
                      ...q,
                      tips: [...(q.tips ?? []), newTip.trim()],
                    };
                  }
                  return q;
                });

                setExam((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    questions: updatedQuestions,
                  };
                });

                // Update localStorage
                const savedExams = localStorage.getItem("exams");
                if (savedExams) {
                  const exams = JSON.parse(savedExams) as Exam[];
                  const updatedExams = exams.map((e) => {
                    if (e.id === exam.id) {
                      return {
                        ...e,
                        questions: updatedQuestions,
                      };
                    }
                    return e;
                  });
                  localStorage.setItem("exams", JSON.stringify(updatedExams));
                }

                setNewTip("");
              }
            }}
          />
          <Button
            onClick={() => {
              if (!newTip.trim()) return;

              const currentQuestionId =
                exam.questions[currentQuestionIndex]?.id;
              if (!currentQuestionId) return;

              const updatedQuestions = exam.questions.map((q) => {
                if (q.id === currentQuestionId) {
                  return {
                    ...q,
                    tips: [...(q.tips ?? []), newTip.trim()],
                  };
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
                    return {
                      ...e,
                      questions: updatedQuestions,
                    };
                  }
                  return e;
                });
                localStorage.setItem("exams", JSON.stringify(updatedExams));
              }

              setNewTip("");
            }}
          >
            Add Tip
          </Button>
        </div>
      </div>
    </div>
  );
}
