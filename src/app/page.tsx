"use client";

import { Button } from "~/components/ui/button";
import { BookOpen, FileText, HelpCircle, PlusCircle } from "lucide-react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/main");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: "url('/assets/Fubuki.png')" }}
      />
      <div className="container relative z-10 px-4 py-16 text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight">
          Welcome to Study
        </h1>
        <p className="mb-12 text-xl text-muted-foreground">
          Your all-in-one platform for creating, managing, and taking exams
        </p>

        <div className="mx-auto mb-16 grid max-w-4xl gap-8 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <BookOpen className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 text-lg font-semibold">Create Exams</h3>
            <p className="text-sm text-muted-foreground">
              Build custom exams from your question bank
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <FileText className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 text-lg font-semibold">Organize Content</h3>
            <p className="text-sm text-muted-foreground">
              Keep your exams and questions organized in folders
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <HelpCircle className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 text-lg font-semibold">Track Progress</h3>
            <p className="text-sm text-muted-foreground">
              Monitor your performance and improve over time
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <SignInButton mode="modal">
            <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Get Started
            </Button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}
