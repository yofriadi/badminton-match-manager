import { createAuthClient } from "better-auth/react";

export const authClient: ReturnType<typeof createAuthClient> =
  createAuthClient({
  baseURL:
    import.meta.env.VITE_BETTER_AUTH_URL ||
    import.meta.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    undefined,
  });
