"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { PlusCircle, Trash2, Save } from "lucide-react"

export default function CreateExamPage() {
  const router = useRouter()
  const [examTitle, setExamTitle] = useState("")
  const [examDescription, setExamDescription] = useState("")
  const [timeLimit, setTimeLimit] = useState("30")
  const [questions, setQuestions] = useState<
    Array<{
      id: string
      type: string
      question: string
      options: string[]
      correctAnswer?: string
      correctAnswers?: string[]
    }>
  >([
    {
      id: "q1",
      type: "multiple-choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    },
  ])

  const addQuestion = () => {
    const newQuestion = {
      id: `q${questions.length + 1}`,
      type: "multiple-choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = [...questions]
      newQuestions.splice(index, 1)
      setQuestions(newQuestions)
    }
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions]

    if (field === "type") {
      // Reset options based on question type
      if (value === "multiple-choice") {
        newQuestions[index] = {
          ...newQuestions[index],
          [field]: value,
          options: ["", "", "", ""],
          correctAnswer: "",
          correctAnswers: undefined,
        }
      } else if (value === "checkbox") {
        newQuestions[index] = {
          ...newQuestions[index],
          [field]: value,
          options: ["", "", "", ""],
          correctAnswers: [],
          correctAnswer: undefined,
        }
      } else if (value === "text") {
        newQuestions[index] = {
          ...newQuestions[index],
          [field]: value,
          options: [],
          correctAnswer: "",
          correctAnswers: undefined,
        }
      }
    } else {
      newQuestions[index] = {
        ...newQuestions[index],
        [field]: value,
      }
    }

    setQuestions(newQuestions)
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex] = value
    setQuestions(newQuestions)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Here you would typically save the exam to your database
    console.log({
      title: examTitle,
      description: examDescription,
      timeLimit: Number.parseInt(timeLimit),
      questions,
    })

    alert("Exam created successfully!")
    router.push("/")
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Create New Exam</h1>

      <form onSubmit={handleSubmit}>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Exam Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Exam Title</Label>
              <Input
                id="title"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="Enter exam title"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={examDescription}
                onChange={(e) => setExamDescription(e.target.value)}
                placeholder="Enter exam description"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
              <Input
                id="timeLimit"
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                min="1"
                required
              />
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold mb-4">Questions</h2>

        {questions.map((question, questionIndex) => (
          <Card key={question.id} className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Question {questionIndex + 1}</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(questionIndex)}
                disabled={questions.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor={`question-${questionIndex}`}>Question</Label>
                <Textarea
                  id={`question-${questionIndex}`}
                  value={question.question}
                  onChange={(e) => updateQuestion(questionIndex, "question", e.target.value)}
                  placeholder="Enter your question"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`type-${questionIndex}`}>Question Type</Label>
                <Select value={question.type} onValueChange={(value) => updateQuestion(questionIndex, "type", value)}>
                  <SelectTrigger id={`type-${questionIndex}`}>
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="checkbox">Checkbox (Multiple Answers)</SelectItem>
                    <SelectItem value="text">Text Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(question.type === "multiple-choice" || question.type === "checkbox") && (
                <div className="space-y-4">
                  <Label>Options</Label>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                        required
                      />

                      {question.type === "multiple-choice" && (
                        <Button
                          type="button"
                          variant={question.correctAnswer === option ? "default" : "outline"}
                          className="whitespace-nowrap"
                          onClick={() => updateQuestion(questionIndex, "correctAnswer", option)}
                          disabled={!option}
                        >
                          Correct
                        </Button>
                      )}

                      {question.type === "checkbox" && (
                        <Button
                          type="button"
                          variant={question.correctAnswers?.includes(option) ? "default" : "outline"}
                          className="whitespace-nowrap"
                          onClick={() => {
                            const currentAnswers = question.correctAnswers || []
                            const newAnswers = currentAnswers.includes(option)
                              ? currentAnswers.filter((a) => a !== option)
                              : [...currentAnswers, option]
                            updateQuestion(questionIndex, "correctAnswers", newAnswers)
                          }}
                          disabled={!option}
                        >
                          Correct
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {question.type === "text" && (
                <div className="grid gap-2">
                  <Label htmlFor={`answer-${questionIndex}`}>Correct Answer</Label>
                  <Textarea
                    id={`answer-${questionIndex}`}
                    value={question.correctAnswer || ""}
                    onChange={(e) => updateQuestion(questionIndex, "correctAnswer", e.target.value)}
                    placeholder="Enter the correct answer"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={addQuestion}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Question
          </Button>

          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save Exam
          </Button>
        </div>
      </form>
    </div>
  )
}
