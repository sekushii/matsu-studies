import { db } from "~/server/db";
import { exams, folders, users, examQuestions } from "./schema";
import { eq, sql } from "drizzle-orm";

export const QUERIES = {
  dbGetUserByExternalId: function (externalId: string) {
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

  dbGetFoldersByUserId: function (userId: number) {
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

  dbGetFoldersWithExamsByUserId: function (userId: number) {
    return db
      .select({
        id: sql<string>`${folders.id}::text`,
        name: folders.name,
        iconUrl: folders.iconUrl,
        exams: sql<string[]>`array_agg(${exams.id}::text)::text[]`,
      })
      .from(folders)
      .leftJoin(exams, eq(exams.folderId, folders.id))
      .where(eq(folders.userId, userId))
      .groupBy(folders.id)
      .orderBy(folders.id);
  },

  dbGetExamsByUserId: function (userId: number) {
    return db
      .select({
        id: sql<string>`${exams.id}::text`,
        title: exams.title,
        description: exams.description,
        timeLimit: exams.timeLimit,
        iconUrl: exams.iconUrl,
        folderId: sql<string>`${exams.folderId}::text`,
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
  dbInsertUser: async function ({
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

  dbInsertFolder: async function ({
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

    return result[0];
  },

  dbInsertExam: async function ({
    userId,
    folderId,
    title,
    description,
    timeLimit,
    iconUrl,
  }: {
    userId: number;
    folderId?: number;
    title: string;
    description?: string;
    timeLimit?: number;
    iconUrl?: string;
  }) {
    const result = await db
      .insert(exams)
      .values({ userId, folderId, title, description, timeLimit, iconUrl })
      .returning({
        id: exams.id,
        title: exams.title,
        description: exams.description,
        timeLimit: exams.timeLimit,
        iconUrl: exams.iconUrl,
        folderId: exams.folderId,
      });

    return result[0];
  },

  dbDeleteExamById: function (examId: number) {
    return db.delete(exams).where(eq(exams.id, examId));
  },

  dbUpdateExamFolder: async function (examId: number, folderId: number | null) {
    const result = await db
      .update(exams)
      .set({ folderId })
      .where(eq(exams.id, examId))
      .returning({
        id: exams.id,
        folderId: exams.folderId,
      });

    return result[0];
  },

  dbDeleteFolderById: function (folderId: number) {
    return db.delete(folders).where(eq(folders.id, folderId));
  },

  dbUpdateFolderIcon: async function (folderId: number, iconUrl: string) {
    const result = await db
      .update(folders)
      .set({ iconUrl })
      .where(eq(folders.id, folderId))
      .returning({
        id: folders.id,
        name: folders.name,
        iconUrl: folders.iconUrl,
      });

    return result[0];
  },

  dbUpdateFolderName: async function (folderId: number, name: string) {
    const result = await db
      .update(folders)
      .set({ name })
      .where(eq(folders.id, folderId))
      .returning({
        id: folders.id,
        name: folders.name,
        iconUrl: folders.iconUrl,
      });

    return result[0];
  },
};
