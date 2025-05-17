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
  createUser: async function ({
    externalId,
    name,
    email,
  }: {
    externalId: string;
    name: string;
    email: string;
  }) {
    const result = await db
      .insert(users)
      .values({ externalId, username: name, email })
      .returning({
        id: users.id,
      })
      .onConflictDoNothing();

    return result[0];
  },

  createFolder: async function ({
    userId,
    name,
    iconUrl,
  }: {
    userId: number;
    name: string;
    iconUrl?: string | null;
  }) {
    const result = await db
      .insert(folders)
      .values({ userId, name, iconUrl })
      .returning({
        id: folders.id,
        name: folders.name,
        iconUrl: folders.iconUrl,
      });

    return {
      id: String(result[0]?.id),
      name: result[0]?.name,
      icon: result[0]?.iconUrl ?? undefined,
    };
  },

  updateExamFolder: function (examId: number, folderId: number) {
    return db
      .update(exams)
      .set({ folderId })
      .where(eq(exams.id, examId))
      .returning();
  },

  deleteFolder: function (folderId: number) {
    return db.delete(folders).where(eq(folders.id, folderId));
  },
};
