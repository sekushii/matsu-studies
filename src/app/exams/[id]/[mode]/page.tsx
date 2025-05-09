"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Textarea } from "~/components/ui/textarea"
import { ArrowLeft, ArrowRight, Clock } from "lucide-react"

// Mock data for questions
const mockExams = {
  "1": {
    id: "1",
    title: "JavaScript Fundamentals",
    description: "Test your knowledge of JavaScript basics",
    timeLimit: 20, // minutes
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        question: "Which of the following is NOT a JavaScript data type?",
        options: ["String", "Boolean", "Float", "Object"],
        correctAnswer: "Float",
      },
      {
        id: "q2",
        type: "multiple-choice",
        question: "What does the '===' operator do in JavaScript?",
        options: [
          "Checks for equality, but not type",
          "Checks for equality, including type",
          "Assigns a value",
          "Checks if a value exists",
        ],
        correctAnswer: "Checks for equality, including type",
      },
      {
        id: "q3",
        type: "checkbox",
        question: "Which of the following are valid ways to declare a variable in JavaScript? (Select all that apply)",
        options: ["var", "let", "const", "function"],
        correctAnswers: ["var", "let", "const"],
      },
      {
        id: "q4",
        type: "text",
        question: "Write a JavaScript function that returns the sum of two numbers.",
        correctAnswer: "function sum(a, b) { return a + b; }",
      },
      {
        id: "q5",
        type: "multiple-choice",
        question: "What is the output of: console.log(typeof [])?",
        options: ["array", "object", "undefined", "null"],
        correctAnswer: "object",
      },
    ],
  },
  "2": {
    id: "2",
    title: "React Concepts",
    description: "Advanced React patterns and hooks",
    timeLimit: 30,
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        question: "Which hook would you use to perform side effects in a function component?",
        options: ["useState", "useEffect", "useContext", "useReducer"],
        correctAnswer: "useEffect",
      },
      {
        id: "q2",
        type: "checkbox",
        question: "Which of the following are built-in React hooks? (Select all that apply)",
        options: ["useEffect", "useState", "useHistory", "useLocalStorage"],
        correctAnswers: ["useEffect", "useState"],
      },
      {
        id: "q3",
        type: "text",
        question: "Write a React functional component that displays 'Hello, World!'",
        correctAnswer: "function HelloWorld() { return <div>Hello, World!</div>; }",
      },
    ],
  },
  // Additional exams would be defined here
}

export default function ExamPage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.id as string
  const mode = params.mode as "review" | "take"

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isTimerActive, setIsTimerActive] = useState(false)

  const exam = mockExams[examId as keyof typeof mockExams]

  if (!exam) {
    return <div className="container py-10">Exam not found</div>
  }

  const questions = exam.questions
  const currentQuestion = questions[currentQuestionIndex]

  // Initialize timer
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (mode === "take") {
      setTimeRemaining(exam.timeLimit * 60)
      setIsTimerActive(true)

      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setIsTimerActive(false)
            // Handle exam completion due to time expiration
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      setIsTimerActive(false)
      setTimeRemaining(0)
    }

    return () => {
      clearInterval(timer)
      setIsTimerActive(false)
    }
  }, [exam.timeLimit, mode])

  // Format time remaining
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else if (mode === "take") {
      // Handle exam submission
      alert("Exam completed! Your answers have been submitted.")
      router.push("/")
    }
  }

  const handleAnswerChange = (value: any) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion.id]: value,
    })
  }

  const handleCheckboxChange = (option: string, checked: boolean) => {
    const currentAnswers = userAnswers[currentQuestion.id] || []
    let newAnswers

    if (checked) {
      newAnswers = [...currentAnswers, option]
    } else {
      newAnswers = currentAnswers.filter((answer: string) => answer !== option)
    }

    setUserAnswers({
      ...userAnswers,
      [currentQuestion.id]: newAnswers,
    })
  }

  const renderQuestionContent = () => {
    const userAnswer = userAnswers[currentQuestion.id]

    switch (currentQuestion.type) {
      case "multiple-choice":
        return (
          <RadioGroup value={userAnswer} onValueChange={handleAnswerChange} className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="text-base">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "checkbox":
        return (
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${index}`}
                  checked={(userAnswer || []).includes(option)}
                  onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
                />
                <Label htmlFor={`option-${index}`} className="text-base">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      case "text":
        return (
          <Textarea
            value={userAnswer || ""}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-[150px]"
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <p className="text-muted-foreground">
            {mode === "review" ? "Review Mode" : "Exam Mode"} - Question {currentQuestionIndex + 1} of{" "}
            {questions.length}
          </p>
        </div>

        {mode === "take" && (
          <div className="flex items-center bg-muted px-4 py-2 rounded-md">
            <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
            <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Question {currentQuestionIndex + 1}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-6">{currentQuestion.question}</p>
          {renderQuestionContent()}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {questions.map((_, index) => (
              <Button
                key={index}
                variant={index === currentQuestionIndex ? "default" : "outline"}
                size="icon"
                className="w-8 h-8"
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>

          <Button onClick={handleNext}>
            {currentQuestionIndex === questions.length - 1 && mode === "take" ? "Submit" : "Next"}
            {currentQuestionIndex < questions.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
