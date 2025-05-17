"use server";

import { auth } from "@clerk/nextjs/server";

import { folders } from "./db/schema";
import { MUTATIONS, QUERIES } from "./db/queries";
import { createInsertSchema } from "drizzle-zod";
import { tryCatch } from "~/lib/try-catch";

// ===== User Authentication & Management =====

export const serverCheckAuth = async () => {
  const { userId } = await auth();
  return { auth: !!userId, userId: userId! };
};

export const serverGetUser = async () => {
  const { auth, userId: userExternalId } = await serverCheckAuth();
  if (!auth) return { auth: false };

  const user = await QUERIES.dbGetUserByExternalId(userExternalId);
  return { auth: !!user[0], user: user[0], userExternalId };
};

export const serverCreateUser = async (name: string, email: string) => {
  const { auth, userId } = await serverCheckAuth();
  if (!auth) return { error: "Unauthorized" };

  const result = await MUTATIONS.dbInsertUser({
    externalId: userId,
    name: name,
    email: email,
  });

  return String(result?.id ?? "");
};

// ===== Folder Management =====

export const serverCreateFolder = async (name: string, iconUrl: string) => {
  const { auth, user } = await serverGetUser();
  if (!auth) return { error: "Unauthorized" };

  const createFolderSchema = createInsertSchema(folders);
  const parsedFolder = createFolderSchema.safeParse({
    userId: user!.id,
    name: name,
    iconUrl: iconUrl,
  });

  if (!parsedFolder.success) return { error: "Invalid folder data" };

  const folder = await tryCatch(MUTATIONS.dbInsertFolder(parsedFolder.data));
  if (folder.error || !folder.data) return { error: "Failed to create folder" };

  return {
    id: String(folder.data.id),
    name: folder.data.name ?? "",
    icon: folder.data.iconUrl ?? undefined,
    exams: [],
  };
};

export const serverGetFolders = async () => {
  const { auth, user } = await serverGetUser();
  if (!auth) return { error: "Unauthorized" };

  const folders = await tryCatch(
    QUERIES.dbGetFoldersWithExamsByUserId(user!.id),
  );
  if (folders.error) return { error: "Failed to get folders" };

  return folders.data;
};

export const serverDeleteFolder = async (folderId: string) => {
  const { auth } = await serverGetUser();
  if (!auth) return { error: "Unauthorized" };

  const result = await tryCatch(MUTATIONS.dbDeleteFolderById(Number(folderId)));
  if (result.error) return { error: "Failed to delete folder" };

  return { success: true };
};

export const serverUpdateFolderIcon = async (
  folderId: string,
  iconUrl: string,
) => {
  const { auth } = await serverGetUser();
  if (!auth) return { error: "Unauthorized" };

  const result = await tryCatch(
    MUTATIONS.dbUpdateFolderIcon(Number(folderId), iconUrl),
  );
  if (result.error || !result.data)
    return { error: "Failed to update folder icon" };

  return {
    id: String(result.data.id),
    name: result.data.name ?? "",
    icon: result.data.iconUrl ?? undefined,
  };
};

export const serverUpdateFolderName = async (
  folderId: string,
  newName: string,
) => {
  const { auth } = await serverGetUser();
  if (!auth) return { error: "Unauthorized" };

  const result = await tryCatch(
    MUTATIONS.dbUpdateFolderName(Number(folderId), newName),
  );
  if (result.error || !result.data) return { error: "Failed to rename folder" };

  return {
    id: String(result.data.id),
    name: result.data.name ?? "",
    icon: result.data.iconUrl ?? undefined,
  };
};

// ===== Exam Management =====

export const serverGetExams = async () => {
  const { auth, user } = await serverGetUser();
  if (!auth) return { error: "Unauthorized" };

  const exams = await tryCatch(QUERIES.dbGetExamsByUserId(user!.id));
  if (exams.error) return { error: "Failed to get exams" };

  return exams.data.map((dbExam) => ({
    id: dbExam.id,
    title: dbExam.title,
    description: dbExam.description ?? "",
    timeLimit: dbExam.timeLimit ?? 0,
    icon: dbExam.iconUrl ?? undefined,
    folderId: dbExam.folderId,
    questions: [],
    topics: [],
  }));
};

export const serverCreateExam = async ({
  title,
  description,
  timeLimit,
  iconUrl,
  folderId,
}: {
  title: string;
  description?: string;
  timeLimit?: number;
  iconUrl?: string;
  folderId?: string;
}) => {
  const { auth, user } = await serverGetUser();
  if (!auth) return { error: "Unauthorized" };

  const exam = await tryCatch(
    MUTATIONS.dbInsertExam({
      userId: user!.id,
      folderId: folderId ? Number(folderId) : undefined,
      title,
      description,
      timeLimit,
      iconUrl,
    }),
  );
  if (exam.error || !exam.data) return { error: "Failed to create exam" };

  return {
    id: String(exam.data.id),
    title: exam.data.title ?? "",
    description: exam.data.description ?? "",
    timeLimit: exam.data.timeLimit ?? 0,
    icon: exam.data.iconUrl ?? undefined,
    folderId: exam.data.folderId ? String(exam.data.folderId) : undefined,
    questions: [],
  };
};

export const serverDeleteExam = async (examId: string) => {
  const { auth } = await serverGetUser();
  if (!auth) return { error: "Unauthorized" };

  const result = await tryCatch(MUTATIONS.dbDeleteExamById(Number(examId)));
  if (result.error) return { error: "Failed to delete exam" };

  return { success: true };
};

export const serverUpdateExamFolder = async (
  examId: string,
  folderId: string | undefined,
) => {
  const { auth } = await serverGetUser();
  if (!auth) return { error: "Unauthorized" };

  const result = await tryCatch(
    MUTATIONS.dbUpdateExamFolder(
      Number(examId),
      folderId ? Number(folderId) : null,
    ),
  );
  if (result.error || !result.data)
    return { error: "Failed to update exam folder" };

  return {
    id: String(result.data.id),
    folderId: result.data.folderId ? String(result.data.folderId) : undefined,
  };
};
