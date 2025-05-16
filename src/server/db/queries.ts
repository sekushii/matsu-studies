import { db } from "~/server/db";
import { exams, folders, users, examQuestions } from "./schema";
import { eq, sql } from "drizzle-orm";

export const QUERIES = {
  getUser: function (externalId: string) {
    return db
      .select({
        id: users.id,
        name: users.username,
        iconUrl: users.iconUrl,
        email: users.email,
      })
      .from(users)
      .where(eq(users.externalId, externalId));
  },

  getFolders: function (userId: number) {
    return db
      .select({
        id: folders.id,
        name: folders.name,
        iconUrl: folders.iconUrl,
      })
      .from(folders)
      .where(eq(folders.userId, userId))
      .orderBy(folders.id);
  },

  getFoldersWithExams: function (userId: number) {
    return db
      .select({
        id: sql<string>`${folders.id}::text`,
        name: folders.name,
        icon: folders.iconUrl,
        exams: sql<string[]>`array_agg(${exams.id}::text)::text[]`,
      })
      .from(folders)
      .leftJoin(exams, eq(exams.folderId, folders.id))
      .where(eq(folders.userId, userId))
      .groupBy(folders.id)
      .orderBy(folders.id);
  },

  getExams: function (userId: number) {
    return db
      .select({
        id: exams.id,
        title: exams.title,
        timeLimit: exams.timeLimit,
        iconUrl: exams.iconUrl,
        questionCount: sql<number>`count(${examQuestions.questionId})::int`,
      })
      .from(exams)
      .leftJoin(examQuestions, eq(examQuestions.examId, exams.id))
      .where(eq(exams.userId, userId))
      .groupBy(exams.id)
      .orderBy(exams.id);
  },
};

export const MUTATIONS = {
  createFolder: function ({
    userId,
    name,
    iconUrl,
  }: {
    userId: number;
    name: string;
    iconUrl?: string | null;
  }) {
    return db.insert(folders).values({ userId, name, iconUrl });
  },

  updateExamFolder: function (examId: number, folderId: number) {
    return db.update(exams).set({ folderId }).where(eq(exams.id, examId));
  },

  deleteFolder: function (folderId: number) {
    return db.delete(folders).where(eq(folders.id, folderId));
  },
};
