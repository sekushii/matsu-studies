// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration
import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  unique,
  index,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";

// USERS & ORGANIZATION
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  externalId: text("external_id").notNull(),
  username: varchar("username", { length: 256 }),
  iconUrl: text("icon_url"),
  email: varchar("email", { length: 256 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => sql`now()`),
});

export const folders = pgTable(
  "folders",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    name: varchar("name", { length: 100 }).notNull(),
    iconUrl: text("icon_url"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => sql`now()`),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [unique().on(t.userId, t.name)],
);

// SUBJECTS & TOPICS
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => sql`now()`),
});

export const topics = pgTable(
  "topics",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id, {
        onDelete: "cascade",
      }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (t) => [unique().on(t.subjectId, t.name)],
);

// QUESTIONS & OPTIONS
export const questions = pgTable(
  "questions",
  {
    id: serial("id").primaryKey(),
    type: varchar("type", { length: 20 }).notNull(),
    text: text("text").notNull(),
    imageUrl: text("image_url"),
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id, {
        onDelete: "set null",
      }),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id, {
        onDelete: "set null",
      }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => sql`now()`),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [
    index("subject_idx").on(t.subjectId),
    index("topic_idx").on(t.topicId),
  ],
);

export const questionOptions = pgTable(
  "question_options",
  {
    id: serial("id").primaryKey(),
    questionId: integer("question_id")
      .notNull()
      .references(() => questions.id, {
        onDelete: "cascade",
      }),
    text: text("text").notNull(),
    imageUrl: text("image_url"),
    isCorrect: boolean("is_correct").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (t) => [index("question_option_idx").on(t.questionId)],
);

// EXAMS & ASSIGNMENT

export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  folderId: integer("folder_id").references(() => folders.id, {
    onDelete: "set null",
  }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  timeLimit: integer("time_limit"),
  iconUrl: text("icon_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => sql`now()`),
  deletedAt: timestamp("deleted_at"),
});

export const examQuestions = pgTable(
  "exam_questions",
  {
    examId: integer("exam_id")
      .notNull()
      .references(() => exams.id, {
        onDelete: "cascade",
      }),
    questionId: integer("question_id")
      .notNull()
      .references(() => questions.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => sql`now()`),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [
    index("question_exam_idx").on(t.questionId),
    primaryKey({ columns: [t.examId, t.questionId] }),
  ],
);

// STUDY DATA

export const studySessions = pgTable(
  "study_sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    questionId: integer("question_id")
      .notNull()
      .references(() => questions.id, {
        onDelete: "cascade",
      }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => sql`now()`),
    firstSeen: timestamp("first_seen"),
    status: varchar("status", { length: 20 }).notNull().default("unseen"),
  },
  (t) => [unique().on(t.userId, t.questionId)],
);

export const studyTips = pgTable("study_tips", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id, {
      onDelete: "cascade",
    }),
  tipText: text("tip_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => sql`now()`),
});

export const studyNotes = pgTable("study_notes", {
  id: serial("id").primaryKey(),
  studySessionId: integer("study_session_id")
    .notNull()
    .references(() => studySessions.id, {
      onDelete: "cascade",
    }),
  noteText: text("note_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => sql`now()`),
});

export const studySolutions = pgTable("study_solutions", {
  id: serial("id").primaryKey(),
  studySessionId: integer("study_session_id")
    .notNull()
    .references(() => studySessions.id, {
      onDelete: "cascade",
    }),
  fileUrl: text("file_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => sql`now()`),
});

export const studyAnswers = pgTable(
  "study_answers",
  {
    id: serial("id").primaryKey(),
    studySessionId: integer("study_session_id")
      .notNull()
      .references(() => studySessions.id, {
        onDelete: "cascade",
      }),
    optionId: integer("option_id")
      .notNull()
      .references(() => questionOptions.id, {
        onDelete: "cascade",
      }),
    isCorrect: boolean("is_correct").notNull(),
    answeredAt: timestamp("answered_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (t) => [index("study_session_idx").on(t.studySessionId)],
);

// TAKE MODE: EXAM ATTEMPTS

export const examAttempts = pgTable(
  "exam_attempts",
  {
    id: serial("id").primaryKey(),
    examId: integer("exam_id")
      .notNull()
      .references(() => exams.id, {
        onDelete: "cascade",
      }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    startedAt: timestamp("started_at"),
    submittedAt: timestamp("submitted_at"),
    totalTimeSec: integer("total_time_sec"),
    score: integer("score"),
    correctCount: integer("correct_count"),
    incorrectCount: integer("incorrect_count"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (t) => [index("exam_idx").on(t.examId), index("user_idx").on(t.userId)],
);

export const attemptQuestions = pgTable(
  "attempt_questions",
  {
    id: serial("id").primaryKey(),
    attemptId: integer("attempt_id")
      .notNull()
      .references(() => examAttempts.id, {
        onDelete: "cascade",
      }),
    questionId: integer("question_id")
      .notNull()
      .references(() => questions.id),
    timeSpentSec: integer("time_spent_sec").notNull().default(0),
    answeredAt: timestamp("answered_at"),
    isCorrect: boolean("is_correct"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (t) => [index("question_attempt_idx").on(t.questionId)],
);

export const attemptAnswers = pgTable("attempt_answers", {
  id: serial("id").primaryKey(),
  attemptQuestionId: integer("attempt_question_id")
    .notNull()
    .references(() => attemptQuestions.id, {
      onDelete: "cascade",
    }),
  optionId: integer("option_id").references(() => questionOptions.id, {
    onDelete: "set null",
  }),
  textAnswer: text("text_answer"),
  selectedAt: timestamp("selected_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => sql`now()`),
});

// SUMMARY

export const questionStats = pgTable("question_stats", {
  questionId: integer("question_id")
    .primaryKey()
    .references(() => questions.id, {
      onDelete: "cascade",
    }),
  totalAttempts: integer("total_attempts").notNull().default(0),
  totalTimeSpent: integer("total_time_spent").notNull().default(0),
  correctCount: integer("correct_count").notNull().default(0),
  incorrectCount: integer("incorrect_count").notNull().default(0),
  lastAttempted: timestamp("last_attempted"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => sql`now()`),
});
