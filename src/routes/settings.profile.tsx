import { ChevronLeft } from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AppPageLayout } from "@/components/app-page-layout";
import { ProfileForm } from "@/app/settings/profile/components/profile-form";
import { requireVerifiedRoute } from "../lib/guards";
import { getTenantServer } from "../server/loaders";

export const Route = createFileRoute("/settings/profile")({
  beforeLoad: requireVerifiedRoute,
  loader: async () => getTenantServer(),
  component: SettingsProfileRoute,
});

function SettingsProfileRoute() {
  const tenant = Route.useLoaderData();

  return (
    <AppPageLayout showCtaButton={false}>
      <div className="mx-auto max-w-md">
        <div className="mb-8">
          <Link
            to="/settings"
            className="mb-4 flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Settings
          </Link>
          <h1 className="text-3xl font-bold">Club Profile</h1>
          <p className="mt-2 text-slate-500">
            Update your club&apos;s public information.
          </p>
        </div>

        <ProfileForm tenant={tenant} />
      </div>
    </AppPageLayout>
  );
}
