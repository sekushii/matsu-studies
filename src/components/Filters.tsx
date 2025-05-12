import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Filter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface FiltersProps {
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  selectedTopics: string[];
  setSelectedTopics: (topics: string[]) => void;
  availableSubjects: string[];
  availableTopics: string[];
}

export function Filters({
  selectedSubject,
  setSelectedSubject,
  selectedTopics,
  setSelectedTopics,
  availableSubjects,
  availableTopics,
}: FiltersProps) {
  return (
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
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
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
  );
} 