import { Card, CardHeader, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Trash2, X, BookOpen, CheckCircle2, Play, Eye, Pencil, Clock, FileText } from "lucide-react";
import Image from "next/image";
import type { Exam } from "~/types";

interface ExamCardProps {
  exam: Exam;
  onDelete: (id: string) => void;
  onRemoveFromFolder?: (id: string) => void;
  draggable?: boolean;
  onDragStart?: () => void;
}

export function ExamCard({
  exam,
  onDelete,
  onRemoveFromFolder,
  draggable,
  onDragStart,
}: ExamCardProps) {
  return (
    <Card
      className="overflow-hidden"
      draggable={draggable}
      onDragStart={onDragStart}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {exam.icon ? (
              <div className="relative h-8 w-8 overflow-hidden rounded-md">
                <Image
                  src={exam.icon}
                  alt={exam.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
            )}
            <div>
              <h3 className="font-semibold">{exam.title}</h3>
              <p className="text-sm text-muted-foreground">
                {exam.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {exam.completed && (
              <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </div>
            )}
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/exams/${exam.id}/take`}>
                <Play className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/exams/${exam.id}/review`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/exams/${exam.id}/edit`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(exam.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {onRemoveFromFolder && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onRemoveFromFolder(exam.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center">
            <FileText className="mr-1 h-4 w-4" />
            {exam.questions.length} questions
          </div>
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            {exam.timeLimit} minutes
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 