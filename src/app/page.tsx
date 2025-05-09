import Link from "next/link"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { PlusCircle, Clock, FileText } from "lucide-react"

export default function ExamListPage() {
  // Mock data for exams
  const exams = [
    {
      id: "1",
      title: "JavaScript Fundamentals",
      description: "Test your knowledge of JavaScript basics",
      questionCount: 10,
      timeLimit: 20, // minutes
      createdAt: "2023-05-15",
    },
    {
      id: "2",
      title: "React Concepts",
      description: "Advanced React patterns and hooks",
      questionCount: 15,
      timeLimit: 30,
      createdAt: "2023-06-22",
    },
    {
      id: "3",
      title: "CSS and Styling",
      description: "Modern CSS techniques and best practices",
      questionCount: 12,
      timeLimit: 25,
      createdAt: "2023-07-10",
    },
    {
      id: "4",
      title: "Web Accessibility",
      description: "WCAG guidelines and implementation",
      questionCount: 8,
      timeLimit: 15,
      createdAt: "2023-08-05",
    },
  ]

  return (
    <div className="container py-10 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Exams</h1>
          <p className="text-muted-foreground mt-1">Manage and take your created exams</p>
        </div>
        <Link href="/exams/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Exam
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <Card key={exam.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle>{exam.title}</CardTitle>
              <CardDescription>{exam.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center">
                  <FileText className="mr-1 h-4 w-4" />
                  {exam.questionCount} questions
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {exam.timeLimit} minutes
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2 pt-3">
              <Link href={`/exams/${exam.id}/review`} className="w-1/2">
                <Button variant="outline" className="w-full">
                  Review
                </Button>
              </Link>
              <Link href={`/exams/${exam.id}/take`} className="w-1/2">
                <Button className="w-full">Take Exam</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
