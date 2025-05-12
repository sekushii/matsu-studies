import { Label } from "@radix-ui/react-label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import type { Exam } from "~/types";
import Image from "next/image";
import { getOptionBackgroundColor } from "../_hooks/_hooks";
import { Checkbox } from "~/components/ui/checkbox";
import { Textarea } from "~/components/ui/textarea";
import type { QuestionType } from "~/types";

interface ExamQuestionsProps {
  type: QuestionType;
  handleAnswerChange: (questionId: string, answer: string | string[]) => void;
  currentQuestionIndex: number;
  answers: Record<string, string | string[]>;
  isSubmitted: boolean;
  exam: Exam;
  mode: "review" | "take";
  isAnswerCorrect: (questionId: string) => boolean;
}

interface MultipleChoiceQuestionProps extends ExamQuestionsProps {
  type: "multiple-choice";
}

interface CheckboxQuestionProps extends ExamQuestionsProps {
  type: "checkbox";
}

interface TextQuestionProps extends ExamQuestionsProps {
  type: "text";
}

interface QuestionOptionProps {
  option: {
    text: string;
    image?: string | null;
  };
  optionIndex: number;
  questionId: string;
  isCorrect: boolean;
  isSelected: boolean;
  isIncorrect: boolean;
  showFeedback: boolean;
  onSelect: (checked: boolean) => void;
  disabled: boolean;
  inputType: "radio" | "checkbox";
}

function QuestionOption({
  option,
  optionIndex,
  questionId,
  isCorrect,
  isSelected,
  //   isIncorrect,
  showFeedback,
  onSelect,
  disabled,
  inputType,
}: QuestionOptionProps) {
  const optionText = option.text || `Option ${optionIndex + 1}`;
  const backgroundColor = getOptionBackgroundColor(
    Boolean(showFeedback),
    Boolean(isCorrect),
  );

  return (
    <div
      key={`${questionId}-option-${optionIndex}`}
      className={`flex items-center space-x-4 rounded-md p-3 ${backgroundColor}`}
    >
      {inputType === "radio" ? (
        <RadioGroupItem
          value={optionText}
          id={`${questionId}-option-${optionIndex}`}
          className={`${
            showFeedback && isCorrect
              ? "border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
              : showFeedback
                ? "border-orange-500"
                : ""
          }`}
        />
      ) : (
        <Checkbox
          id={`${questionId}-option-${optionIndex}`}
          checked={isSelected}
          onCheckedChange={onSelect}
          disabled={disabled}
          className={`${
            showFeedback && isCorrect
              ? "border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
              : showFeedback
                ? "border-orange-500"
                : ""
          }`}
        />
      )}
      <div className="flex items-center gap-4">
        {option.image && (
          <div className="relative h-16 w-16 overflow-hidden rounded-md">
            <Image
              src={option.image}
              alt={optionText}
              fill
              className="object-cover"
            />
          </div>
        )}
        <Label
          htmlFor={`${questionId}-option-${optionIndex}`}
          className="text-base"
        >
          {optionText}
        </Label>
      </div>
    </div>
  );
}

function MultipleChoiceQuestion({
  handleAnswerChange,
  currentQuestionIndex,
  answers,
  isSubmitted,
  exam,
  mode,
}: MultipleChoiceQuestionProps) {
  return (
    <RadioGroup
      value={
        (answers[exam.questions[currentQuestionIndex]?.id ?? ""] as string) ??
        ""
      }
      onValueChange={(value) =>
        handleAnswerChange(
          exam.questions[currentQuestionIndex]?.id ?? "",
          value,
        )
      }
      disabled={isSubmitted}
      className="space-y-2"
    >
      {exam.questions[currentQuestionIndex]?.options.map(
        (option, optionIndex) => {
          const isCorrect =
            option.text === exam.questions[currentQuestionIndex]?.correctAnswer;
          const isSelected =
            option.text ===
            answers[exam.questions[currentQuestionIndex]?.id ?? ""];
          const isIncorrect =
            exam.questions[currentQuestionIndex]?.incorrectAnswers?.includes(
              option.text,
            ) ?? false;
          const showFeedback = mode === "review" && (isSelected || isIncorrect);

          return (
            <QuestionOption
              key={`${exam.questions[currentQuestionIndex]?.id ?? ""}-option-${optionIndex}`}
              option={option}
              optionIndex={optionIndex}
              questionId={exam.questions[currentQuestionIndex]?.id ?? ""}
              isCorrect={isCorrect ?? false}
              isSelected={isSelected ?? false}
              isIncorrect={isIncorrect}
              showFeedback={showFeedback}
              onSelect={() =>
                handleAnswerChange(
                  exam.questions[currentQuestionIndex]?.id ?? "",
                  option.text,
                )
              }
              disabled={isSubmitted}
              inputType="radio"
            />
          );
        },
      )}
    </RadioGroup>
  );
}

function CheckboxQuestion({
  handleAnswerChange,
  currentQuestionIndex,
  answers,
  isSubmitted,
  exam,
  mode,
}: CheckboxQuestionProps) {
  return (
    <div className="space-y-2">
      {exam.questions[currentQuestionIndex]?.options.map(
        (option, optionIndex) => {
          const isCorrect =
            exam.questions[currentQuestionIndex]?.correctAnswers?.includes(
              option.text,
            ) ?? false;
          const isSelected = (
            (answers[
              exam.questions[currentQuestionIndex]?.id ?? ""
            ] as string[]) ?? []
          )?.includes(option.text);
          const isIncorrect =
            exam.questions[currentQuestionIndex]?.incorrectAnswers?.includes(
              option.text,
            ) ?? false;
          const showFeedback = mode === "review" && (isSelected || isIncorrect);

          return (
            <QuestionOption
              key={`${exam.questions[currentQuestionIndex]?.id ?? ""}-option-${optionIndex}`}
              option={option}
              optionIndex={optionIndex}
              questionId={exam.questions[currentQuestionIndex]?.id ?? ""}
              isCorrect={isCorrect}
              isSelected={isSelected ?? false}
              isIncorrect={isIncorrect}
              showFeedback={showFeedback}
              onSelect={(checked) => {
                const currentAnswers =
                  (answers[
                    exam.questions[currentQuestionIndex]?.id ?? ""
                  ] as string[]) ?? [];
                const newAnswers = checked
                  ? [...currentAnswers, option.text]
                  : currentAnswers.filter((a) => a !== option.text);
                handleAnswerChange(
                  exam.questions[currentQuestionIndex]?.id ?? "",
                  newAnswers,
                );
              }}
              disabled={isSubmitted}
              inputType="checkbox"
            />
          );
        },
      )}
    </div>
  );
}

function TextQuestion({
  handleAnswerChange,
  currentQuestionIndex,
  answers,
  isSubmitted,
  exam,
  mode,
  isAnswerCorrect,
}: TextQuestionProps) {
  return (
    <div className="space-y-2">
      <Textarea
        value={
          answers[exam.questions[currentQuestionIndex]?.id ?? ""] as string
        }
        onChange={(e) =>
          handleAnswerChange(
            exam.questions[currentQuestionIndex]?.id ?? "",
            e.target.value,
          )
        }
        placeholder="Enter your answer"
        disabled={isSubmitted}
        className={`w-full ${
          mode === "review" &&
          answers[exam.questions[currentQuestionIndex]?.id ?? ""]
            ? isAnswerCorrect(exam.questions[currentQuestionIndex]?.id ?? "")
              ? "border-green-500"
              : "border-orange-500"
            : ""
        }`}
      />
      {isSubmitted && (
        <div className="rounded-md bg-muted p-4">
          <p className="font-medium">Correct Answer:</p>
          <p>{exam.questions[currentQuestionIndex]?.correctAnswer}</p>
        </div>
      )}
    </div>
  );
}

export function ExamQuestions({
  type,
  handleAnswerChange,
  currentQuestionIndex,
  answers,
  isSubmitted,
  exam,
  mode,
  isAnswerCorrect,
}: ExamQuestionsProps) {
  switch (type) {
    case "multiple-choice":
      return (
        <MultipleChoiceQuestion
          type={type}
          handleAnswerChange={handleAnswerChange}
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          isSubmitted={isSubmitted}
          exam={exam}
          mode={mode}
          isAnswerCorrect={isAnswerCorrect}
        />
      );
    case "checkbox":
      return (
        <CheckboxQuestion
          type={type}
          handleAnswerChange={handleAnswerChange}
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          isSubmitted={isSubmitted}
          exam={exam}
          mode={mode}
          isAnswerCorrect={isAnswerCorrect}
        />
      );
    case "text":
      return (
        <TextQuestion
          type={type}
          handleAnswerChange={handleAnswerChange}
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          isSubmitted={isSubmitted}
          exam={exam}
          mode={mode}
          isAnswerCorrect={isAnswerCorrect}
        />
      );
  }
}
