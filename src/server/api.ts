import { getAuth } from "@/lib/auth";

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function requireApiSession(request: Request) {
  const session = await getAuth().api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return session;
}

export async function requireApiVerifiedSession(request: Request) {
  const session = await requireApiSession(request);

  if (!session.user.emailVerified) {
    throw new Response("Forbidden", { status: 403 });
  }

  return session;
}

export async function requireApiAdminSession(request: Request) {
  const session = await requireApiVerifiedSession(request);

  if (session.user.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }

  return session;
}
