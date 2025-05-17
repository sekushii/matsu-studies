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

  const id = await MUTATIONS.dbInsertUser({
    externalId: userId,
    name: name,
    email: email,
  });

  return id;
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

  return folder.data;
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
  if (result.error) return { error: "Failed to update folder icon" };

  return result.data;
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
  if (result.error) return { error: "Failed to rename folder" };

  return result.data;
};
