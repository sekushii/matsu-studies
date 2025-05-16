import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { ImageUpload } from "~/components/ImageUpload";
import type { Exam } from "~/types";

interface ExamDetailsFormProps {
  exam: Exam;
  onExamChange: (exam: Exam) => void;
  onImageChange: (image: string | null) => void;
  showHeader?: boolean;
  className?: string;
  children?: ReactNode;
}

export function ExamDetailsForm({
  exam,
  onExamChange,
  onImageChange,
  showHeader = true,
  className = "",
  children,
}: ExamDetailsFormProps) {
  return (
    <div className={`flex h-full items-center justify-center ${className}`}>
      <Card className="w-full max-w-3xl">
        {showHeader && (
          <CardHeader>
            <CardTitle>Create your exam!~ </CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          {/* Exam Icon */}
          <div className="flex justify-center">
            <ImageUpload
              id="exam-icon"
              value={exam.icon}
              onChange={onImageChange}
              uploadButtonText="Upload exam icon"
              className="h-48 w-48"
              aspectRatio="square"
            />
          </div>

          {/* Title */}
          <div className="relative grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={exam.title}
              onChange={(e) => onExamChange({ ...exam, title: e.target.value })}
              maxLength={100}
              className="pr-16"
            />
            <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {exam.title.length}/100
            </span>
          </div>

          {/* Description */}
          <div className="relative grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={exam.description}
              onChange={(e) =>
                onExamChange({ ...exam, description: e.target.value })
              }
              maxLength={500}
              className="pr-16"
            />
            <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {exam.description.length}/500
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2">{children}</div>
        </CardContent>
      </Card>
    </div>
  );
}
