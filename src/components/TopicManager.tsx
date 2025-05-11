import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { X } from "lucide-react";

interface TopicManagerProps {
  topics: string[];
  onAddTopic: (topic: string) => void;
  onRemoveTopic: (topic: string) => void;
  label?: string;
  placeholder?: string;
}

export function TopicManager({
  topics,
  onAddTopic,
  onRemoveTopic,
  label = "Topics",
  placeholder = "Type a topic and press Enter",
}: TopicManagerProps) {
  const [topicInput, setTopicInput] = useState("");

  const handleAddTopic = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && topicInput.trim()) {
      e.preventDefault();
      if (!topics.includes(topicInput.trim())) {
        onAddTopic(topicInput.trim());
      }
      setTopicInput("");
    }
  };

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex flex-col gap-2">
        {topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <div
                key={topic}
                className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1"
              >
                <span>{topic}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => onRemoveTopic(topic)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <Input
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          onKeyDown={handleAddTopic}
          placeholder={placeholder}
          className="w-full"
        />
      </div>
    </div>
  );
} 