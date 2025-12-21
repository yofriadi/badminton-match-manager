"use client";

import { useEffect, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { toast } from "sonner";

type UserRow = {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        setAuthError("You must be an admin to view this page.");
      } else {
        toast.error("Failed to load users");
      }
      setLoading(false);
      return;
    }
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const confirmUser = async (id: string) => {
    setConfirming(id);
    const res = await fetch(`/api/admin/users/${id}/confirm`, { method: "POST" });
    if (!res.ok) {
      toast.error("Failed to confirm user");
      setConfirming(null);
      return;
    }
    toast.success("User confirmed");
    await fetchPending();
    setConfirming(null);
  };

  return (
    <div className="flex min-h-screen w-full items-start justify-center p-6">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">User Approvals</CardTitle>
          <CardDescription>
            Approve new registrations before they can log in.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {authError && (
            <div className="p-6 text-sm text-red-500">{authError}</div>
          )}
          <div className="grid grid-cols-12 px-6 pb-3 text-xs font-medium text-muted-foreground">
            <span className="col-span-9">Email</span>
            <span className="col-span-3 text-right">Action</span>
          </div>
          <Separator />
          <div className="divide-y">
            {loading ? (
              <div className="p-6 text-sm text-muted-foreground">Loading…</div>
            ) : users.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                No pending users.
              </div>
            ) : (
              users.map((u) => (
                <div key={u.id} className="grid grid-cols-12 items-center px-6 py-3 text-sm">
                  <span className="col-span-9 break-all">{u.email}</span>
                  <span className="col-span-3 flex justify-end">
                    <Button
                      variant="default"
                      size="sm"
                      disabled={u.emailVerified || confirming === u.id}
                      onClick={() => confirmUser(u.id)}
                    >
                      {confirming === u.id ? "Saving…" : u.emailVerified ? "Approved" : "Approve"}
                    </Button>
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
