import { createFileRoute } from "@tanstack/react-router";
import SignUpPage from "@/app/signup/page";
import { redirectVerifiedUsers } from "../lib/guards";

export const Route = createFileRoute("/signup")({
  beforeLoad: redirectVerifiedUsers,
  component: SignUpPage,
});
