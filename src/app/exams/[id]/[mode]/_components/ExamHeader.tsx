import { Button } from "~/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";
import type { Exam } from "~/types";

interface ExamHeaderProps {
  exam: Exam;
  children?: React.ReactNode;
}

export function ExamHeader({ exam }: ExamHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{exam.title}</h1>
          <p className="text-muted-foreground">{exam.description}</p>
        </div>
        <Link href="/">
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
  );
} 