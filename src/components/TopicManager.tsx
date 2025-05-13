import type { ChangeEvent, KeyboardEvent, MouseEvent } from "react";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { X } from "lucide-react";

interface TopicManagerProps {
  topics: string[];
  onAddTopic: (topic: string) => void;
  onRemoveTopic: (topic: string) => void;
  topicLimit?: number; // New optional limit prop
  label?: string;
  placeholder?: string;
}

export function TopicManager({
  topics,
  onAddTopic,
  onRemoveTopic,
  topicLimit = Infinity,
  label = "Topics",
  placeholder = "Type a topic and press Enter",
}: TopicManagerProps) {
  const [topicInput, setTopicInput] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = topicInput.trim();
      if (trimmed && !topics.includes(trimmed) && topics.length < topicLimit) {
        onAddTopic(trimmed);
      }
      setTopicInput("");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTopicInput(e.currentTarget.value);
  };

  const handleAddClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const trimmed = topicInput.trim();
    if (trimmed && !topics.includes(trimmed) && topics.length < topicLimit) {
      onAddTopic(trimmed);
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
        <div className="flex items-center gap-2">
          <Input
            value={topicInput}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddClick}
            disabled={
              !topicInput.trim() ||
              topics.includes(topicInput.trim()) ||
              topics.length >= topicLimit
            }
          >
            Add
          </Button>
        </div>
        {topics.length >= topicLimit && (
          <p className="text-center text-xs text-red-500">
            Maximum of {topicLimit} topics reached.
          </p>
        )}
      </div>
    </div>
  );
}
