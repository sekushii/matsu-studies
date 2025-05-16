import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { X, ChevronDown } from "lucide-react";
import type { SubjectSelectorProps } from "~/types";

export function SubjectSelector({
  selectedSubject,
  availableSubjects,
  onSubjectSelect,
  onSubjectRemove,
  onNewSubject,
  subjectLimit,
}: SubjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input && !availableSubjects.includes(input)) {
      e.preventDefault();
      if (availableSubjects.length < subjectLimit) {
        onNewSubject(input);
        setInput("");
      }
    }
  };

  return (
    <div className="grid gap-1.5">
      <Label htmlFor="subject" className="text-sm">
        Subject
      </Label>
      <div className="flex items-center gap-2">
        {selectedSubject ? (
          <div className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-sm">
            <span>{selectedSubject}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-3 w-3 p-0 hover:bg-transparent"
              onClick={() => onSubjectSelect("")}
            >
              <X className="h-2.5 w-2.5" />
            </Button>
          </div>
        ) : (
          <div className="relative flex-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 w-full justify-between text-sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              Select a subject
              <ChevronDown className="h-3 w-3" />
            </Button>
            {isOpen && (
              <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                {availableSubjects.length === 0 ? (
                  <div className="px-2 py-1 text-center text-xs text-muted-foreground">
                    No subjects available
                  </div>
                ) : (
                  <div className="max-h-[200px] overflow-y-auto">
                    {availableSubjects.map((subj) => (
                      <div
                        key={subj}
                        className="flex items-center justify-between px-2 py-1 text-sm hover:bg-accent"
                      >
                        <button
                          type="button"
                          className="flex-1 text-left"
                          onClick={() => {
                            onSubjectSelect(subj);
                            setIsOpen(false);
                          }}
                        >
                          {subj}
                        </button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSubjectRemove(subj);
                            onSubjectSelect("");
                          }}
                        >
                          <X className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {!selectedSubject && (
          <div className="flex flex-1 gap-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type new subject"
              className="h-7 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-sm"
              onClick={() => {
                if (
                  input &&
                  !availableSubjects.includes(input) &&
                  availableSubjects.length < subjectLimit
                ) {
                  onNewSubject(input);
                  setInput("");
                }
              }}
              disabled={!input || availableSubjects.length >= subjectLimit}
            >
              Add
            </Button>
          </div>
        )}
      </div>
      {availableSubjects.length >= subjectLimit && (
        <p className="text-center text-xs text-destructive">
          Maximum of {subjectLimit} subjects reached
        </p>
      )}
    </div>
  );
}
