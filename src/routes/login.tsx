import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "@/app/login/page";
import { redirectVerifiedUsers } from "../lib/guards";

export const Route = createFileRoute("/login")({
  beforeLoad: redirectVerifiedUsers,
  component: LoginPage,
});
