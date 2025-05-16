"use server";

import { auth } from "@clerk/nextjs/server";

import { users } from "./db/schema";
import { db } from "./db";

export const createUser = async (
  userId: string,
  name: string,
  email: string,
) => {
  const { userId: authUserId } = await auth();

  if (authUserId !== userId) {
    return;
  }

  await db
    .insert(users)
    .values({
      externalId: userId,
      username: name,
      email: email,
    })
    .onConflictDoNothing();
};
