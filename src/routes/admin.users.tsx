import { createFileRoute } from "@tanstack/react-router";
import AdminUsersPage from "@/app/admin/users/page";
import { requireAdminRoute } from "../lib/guards";

export const Route = createFileRoute("/admin/users")({
  beforeLoad: requireAdminRoute,
  component: AdminUsersPage,
});
