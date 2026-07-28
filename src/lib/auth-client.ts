import { createAuthClient } from "better-auth/react";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(
  {
    // Same-origin by default. Override only when the auth API is hosted elsewhere.
    baseURL: import.meta.env.VITE_BETTER_AUTH_URL || undefined,
  },
);
