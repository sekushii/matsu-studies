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
}: SubjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input && !availableSubjects.includes(input)) {
      e.preventDefault();
      onNewSubject(input);
      setInput("");
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="subject">Subject</Label>
      <div className="flex flex-col gap-2">
        {selectedSubject && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
              <span>{selectedSubject}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => onSubjectSelect("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between"
              onClick={() => setIsOpen(!isOpen)}
            >
              Select a subject
              <ChevronDown className="h-4 w-4" />
            </Button>
            {isOpen && (
              <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                {availableSubjects.map((subj) => (
                  <div
                    key={subj}
                    className="flex items-center justify-between px-2 py-1.5 hover:bg-accent"
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
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSubjectRemove(subj);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Or type a new subject and press add"
              className="w-full"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (input && !availableSubjects.includes(input)) {
                  onNewSubject(input);
                  setInput("");
                }
              }}
              disabled={!input}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
