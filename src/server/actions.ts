"use server";

import { auth } from "@clerk/nextjs/server";

import { users, folders } from "./db/schema";
import { db } from "./db";
import { MUTATIONS, QUERIES } from "./db/queries";
import { createInsertSchema } from "drizzle-zod";
import { tryCatch } from "~/lib/try-catch";

const isUserAuthenticated = async () => {
  const { userId } = await auth();

  return { auth: !!userId, userId: userId! };
};

const getUser = async () => {
  const { auth, userId: userExternalId } = await isUserAuthenticated();
  if (!auth) return { auth: false };

  const user = await QUERIES.getUser(userExternalId);

  return { auth: !!user[0], user: user[0], userExternalId };
};

export const createUser = async (name: string, email: string) => {
  const { auth, userId } = await isUserAuthenticated();

  if (!auth) return { error: "Unauthorized" };

  await db
    .insert(users)
    .values({
      externalId: userId,
      username: name,
      email: email,
    })
    .onConflictDoNothing();
};

export const createFolder = async (name: string, iconUrl: string) => {
  const { auth, user } = await getUser();

  if (!auth) return { error: "Unauthorized" };

  const createFolderSchema = createInsertSchema(folders);
  const parsedFolder = createFolderSchema.safeParse({
    userId: user!.id,
    name,
    iconUrl,
  });

  if (!parsedFolder.success) return { error: "Invalid folder data" };

  const folder = await tryCatch(MUTATIONS.createFolder(parsedFolder.data));

  if (folder.error) return { error: "Failed to create folder" };

  return folder.data;
};

export const getFolders = async () => {
  const { auth, user } = await getUser();

  if (!auth) return { error: "Unauthorized" };

  const folders = await QUERIES.getFoldersWithExams(user!.id);

  return folders;
};
