"use server";

import { auth } from "@clerk/nextjs/server";

import { users, folders } from "./db/schema";
import { db } from "./db";
import { MUTATIONS, QUERIES } from "./db/queries";
import { createInsertSchema } from "drizzle-zod";
import { tryCatch } from "~/lib/try-catch";

export const USER_ACTIONS = {
  isUserAuthenticated: async function () {
    const { userId } = await auth();

    return { auth: !!userId, userId: userId! };
  },

  getUser: async function () {
    const { auth, userId: userExternalId } = await this.isUserAuthenticated();
    if (!auth) return { auth: false };

    const user = await QUERIES.getUser(userExternalId);

    return { auth: !!user[0], user: user[0], userExternalId };
  },

  createUser: async function (name: string, email: string) {
    const { auth, userId } = await this.isUserAuthenticated();

    if (!auth) return { error: "Unauthorized" };

    await MUTATIONS.createUser({
      externalId: userId,
      name: name,
      email: email,
    });
  },
};

export const FOLDER_ACTIONS = {
  createFolder: async function (name: string, iconUrl: string) {
    const { auth, user } = await USER_ACTIONS.getUser();

    if (!auth) return { error: "Unauthorized" };

    const createFolderSchema = createInsertSchema(folders);
    const parsedFolder = createFolderSchema.safeParse({
      userId: user!.id,
      name: name,
      iconUrl: iconUrl,
    });

    if (!parsedFolder.success) return { error: "Invalid folder data" };

    const folder = await tryCatch(MUTATIONS.createFolder(parsedFolder.data));

    if (folder.error || !folder.data)
      return { error: "Failed to create folder" };

    return folder.data;
  },

  getFolders: async function () {
    const { auth, user } = await this.getUser();

    if (!auth) return { error: "Unauthorized" };

    const folders = await QUERIES.getFoldersWithExams(user!.id);

    return folders;
  },
};
