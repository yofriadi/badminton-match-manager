import { ChevronRight, User } from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AppPageLayout } from "@/components/app-page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { requireVerifiedRoute } from "../lib/guards";

export const Route = createFileRoute("/settings/")({
  beforeLoad: requireVerifiedRoute,
  component: SettingsRoute,
});

function SettingsRoute() {
  const settingsOptions = [
    {
      title: "Profile",
      description: "Manage your club name, description, and contact info.",
      href: "/settings/profile",
      icon: User,
    },
  ] as const;

  return (
    <AppPageLayout showCtaButton={false}>
      <div className="flex min-h-[calc(100vh-140px)] max-w-md flex-col justify-end pb-4 mx-auto">
        <div className="space-y-4">
          {settingsOptions.map((option) => (
            <Link
              key={option.href}
              to={option.href}
              className="block"
            >
              <Card>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <option.icon className="h-8 w-8 text-slate-600" />
                    <div>
                      <h2 className="font-semibold text-slate-900">
                        {option.title}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppPageLayout>
  );
}
