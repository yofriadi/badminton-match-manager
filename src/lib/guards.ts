import { redirect } from "@tanstack/react-router";
import { getSessionServer } from "../server/loaders";

export async function requireAuthenticatedRoute() {
  const session = await getSessionServer();

  if (!session?.user) {
    throw redirect({ to: "/login" });
  }

  return session;
}

export async function requireVerifiedRoute() {
  const session = await requireAuthenticatedRoute();

  if (!session.user.emailVerified) {
    throw redirect({ to: "/login" });
  }

  return session;
}

export async function requireAdminRoute() {
  const session = await requireVerifiedRoute();

  if (session.user.role !== "admin") {
    throw redirect({ to: "/login" });
  }

  return session;
}

export async function redirectVerifiedUsers() {
  const session = await getSessionServer();

  if (session?.user?.emailVerified) {
    throw redirect({ to: "/schedules" });
  }
}
