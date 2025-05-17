"use client";
import { useEffect, useRef } from "react";
import "~/styles/globals.css";

import { useAuth, useUser } from "@clerk/nextjs";
import { USER_ACTIONS } from "~/server/actions";

export default function Initializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const initialized = useRef(false);

  useEffect(() => {
    if (isLoaded && user && userId && !initialized.current) {
      void USER_ACTIONS.createUser(
        user.fullName!,
        user.emailAddresses[0]!.emailAddress,
      );
      initialized.current = true;
    }
  }, [isLoaded, userId, user]);

  return <>{children}</>;
}
