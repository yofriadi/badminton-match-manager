import { ChevronRight, User } from "lucide-react";
import Link from "next/link";
import { AppPageLayout } from "@/components/app-page-layout";
import { Card, CardContent } from "@workspace/ui/components/card";

export default function SettingsPage() {
  const settingsOptions = [
    {
      title: "Profile",
      description: "Manage your club name, description, and contact info.",
      href: "/settings/profile",
      icon: User,
    },
  ];

  return (
    <AppPageLayout showCtaButton={false}>
      <div className="flex flex-col min-h-[calc(100vh-140px)] justify-end max-w-md mx-auto pb-4">
        <div className="space-y-4">
          {settingsOptions.map((option) => (
            <Link key={option.href} href={option.href} className="block">
              <Card>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <option.icon className="w-8 h-8 text-slate-600" />
                    <div>
                      <h2 className="font-semibold text-slate-900">
                        {option.title}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppPageLayout>
  );
}
