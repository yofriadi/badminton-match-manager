import { requireTenant } from "@/lib/session-utils";
import { AppPageLayout } from "@/components/app-page-layout";
import { ProfileForm } from "./components/profile-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const tenant = await requireTenant();

  return (
    <AppPageLayout showCtaButton={false}>
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <Link
            href="/settings"
            className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Settings
          </Link>
          <h1 className="text-3xl font-bold">Club Profile</h1>
          <p className="text-slate-500 mt-2">
            Update your club's public information.
          </p>
        </div>

        <ProfileForm tenant={tenant} />
      </div>
    </AppPageLayout>
  );
}
