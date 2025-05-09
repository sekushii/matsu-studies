"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  PlusCircle,
  Clock,
  FileText,
  Pencil,
  FolderPlus,
  Trash2,
  X,
  Upload,
  BookOpen,
  CheckCircle2,
  Play,
  Eye,
  Filter,
  HelpCircle,
} from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";

interface Exam {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  icon?: string;
  folderId?: string;
  questions: Array<{
    id: string;
    type: string;
    question: string;
    options?: string[];
    correctAnswer?: string;
    correctAnswers?: string[];
  }>;
  completed: boolean;
  subject?: string;
  topics?: string[];
}

interface Folder {
  id: string;
  name: string;
  icon?: string; // Base64 image data
  exams: string[]; // Array of exam IDs
}

export default function ExamListPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [draggedExamId, setDraggedExamId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);

  useEffect(() => {
    // Load exams and folders from localStorage
    const savedExams = localStorage.getItem("exams");
    const savedFolders = localStorage.getItem("folders");
    const savedSubjects = localStorage.getItem("exam-subjects");

    if (savedExams) {
      const parsedExams = JSON.parse(savedExams) as Exam[];
      setExams(parsedExams);

      // Extract unique topics from all exams
      const topics = new Set<string>();
      parsedExams.forEach((exam) => {
        exam.topics?.forEach((topic) => topics.add(topic));
      });
      setAvailableTopics(Array.from(topics));
    }

    if (savedFolders) {
      const parsedFolders = JSON.parse(savedFolders) as Folder[];
      setFolders(parsedFolders);
    }

    if (savedSubjects) {
      setAvailableSubjects(JSON.parse(savedSubjects) as string[]);
    }
  }, []);

  const filteredExams = exams.filter((exam) => {
    const matchesSubject =
      selectedSubject === "all" || exam.subject === selectedSubject;
    const matchesTopics =
      selectedTopics.length === 0 ||
      selectedTopics.every((topic) => exam.topics?.includes(topic));
    return matchesSubject && matchesTopics;
  });

  const deleteExam = (examId: string) => {
    // Remove exam from exams array
    const updatedExams = exams.filter((exam) => exam.id !== examId);
    setExams(updatedExams);
    localStorage.setItem("exams", JSON.stringify(updatedExams));

    // Remove exam answers from localStorage
    localStorage.removeItem(`exam-answers-${examId}`);
  };

  const removeExamFromFolder = (examId: string) => {
    const updatedExams = exams.map((exam) =>
      exam.id === examId ? { ...exam, folderId: undefined } : exam,
    );
    setExams(updatedExams);
    localStorage.setItem("exams", JSON.stringify(updatedExams));
  };

  const handleDragStart = (examId: string) => {
    setDraggedExamId(examId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (folderId: string) => {
    if (!draggedExamId) return;

    // Update exam's folder
    const updatedExams = exams.map((exam) =>
      exam.id === draggedExamId ? { ...exam, folderId } : exam,
    );
    setExams(updatedExams);
    localStorage.setItem("exams", JSON.stringify(updatedExams));
    setDraggedExamId(null);
  };

  const createFolder = () => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name: `New Folder ${folders.length + 1}`,
      exams: [],
    };
    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    localStorage.setItem("folders", JSON.stringify(updatedFolders));
  };

  const deleteFolder = (folderId: string) => {
    // Remove folder
    const updatedFolders = folders.filter((f) => f.id !== folderId);
    setFolders(updatedFolders);
    localStorage.setItem("folders", JSON.stringify(updatedFolders));

    // Remove folder reference from exams
    const updatedExams = exams.map((exam) =>
      exam.folderId === folderId ? { ...exam, folderId: undefined } : exam,
    );
    setExams(updatedExams);
    localStorage.setItem("exams", JSON.stringify(updatedExams));
  };

  const handleFolderIconUpload = (
    folderId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedFolders = folders.map((folder) =>
        folder.id === folderId
          ? { ...folder, icon: reader.result as string }
          : folder,
      );
      setFolders(updatedFolders);
      localStorage.setItem("folders", JSON.stringify(updatedFolders));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Exams</h1>
          <p className="mt-1 text-muted-foreground">
            Manage and take your created exams
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={createFolder}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <Link href="/questions">
            <Button variant="outline">
              <HelpCircle className="mr-2 h-4 w-4" />
              Questions
            </Button>
          </Link>
          <Link href="/summary">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Summary
            </Button>
          </Link>
          <Link href="/exams/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Exam
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Exams Section */}
        <div className="flex-1">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExams
              .filter((exam) => !exam.folderId)
              .map((exam) => (
                <Card
                  key={exam.id}
                  className="overflow-hidden"
                  draggable
                  onDragStart={() => handleDragStart(exam.id)}
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
                          onClick={() => deleteExam(exam.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
              ))}
          </div>
        </div>

        {/* Folders Section */}
        <div className="w-64 space-y-4">
          <Card className="mb-4">
            <CardHeader className="py-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 py-2">
              <div className="space-y-2">
                <Label className="text-sm">Subject</Label>
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="All subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All subjects</SelectItem>
                    {availableSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Topics</Label>
                <Select
                  value="none"
                  onValueChange={(value) => {
                    if (value !== "none" && !selectedTopics.includes(value)) {
                      setSelectedTopics([...selectedTopics, value]);
                    }
                  }}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select topics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" disabled>
                      Select a topic
                    </SelectItem>
                    {availableTopics
                      .filter((topic) => !selectedTopics.includes(topic))
                      .map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {selectedTopics.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedTopics.map((topic) => (
                      <div
                        key={topic}
                        className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs"
                      >
                        <span>{topic}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-3 w-3 p-0"
                          onClick={() =>
                            setSelectedTopics(
                              selectedTopics.filter((t) => t !== topic),
                            )
                          }
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <h2 className="text-xl font-semibold">Folders</h2>
          <div className="space-y-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="relative cursor-pointer rounded-lg border p-4"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(folder.id)}
                onClick={() => setSelectedFolder(folder)}
              >
                <div className="absolute right-2 top-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFolder(folder.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mb-2 text-center font-medium">
                  {folder.name}
                </div>
                <div className="relative aspect-square w-full overflow-hidden rounded-md">
                  {folder.icon ? (
                    <Image
                      src={folder.icon}
                      alt={folder.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) => handleFolderIconUpload(folder.id, e)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="mt-2 text-center text-sm text-muted-foreground">
                  {exams.filter((exam) => exam.folderId === folder.id).length}{" "}
                  exams
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Folder Content Dialog */}
      {selectedFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-4xl rounded-lg bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{selectedFolder.name}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedFolder(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {exams
                .filter((exam) => exam.folderId === selectedFolder.id)
                .map((exam) => (
                  <Card key={exam.id} className="overflow-hidden">
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
                          ) : null}
                          <div>
                            <CardTitle>{exam.title}</CardTitle>
                            <CardDescription>
                              {exam.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeExamFromFolder(exam.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => deleteExam(exam.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                    <CardFooter className="flex justify-between gap-2 pt-3">
                      <Link href={`/exams/${exam.id}/edit`} className="w-1/3">
                        <Button variant="outline" className="w-full">
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/exams/${exam.id}/review`} className="w-1/3">
                        <Button variant="outline" className="w-full">
                          Review
                        </Button>
                      </Link>
                      <Link href={`/exams/${exam.id}/take`} className="w-1/3">
                        <Button className="w-full">Take Exam</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
