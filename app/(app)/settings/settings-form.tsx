"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile, changePassword } from "../actions";

export function SettingsForm({ name, avatar }: { name: string; avatar: string }) {
  const router = useRouter();
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [savingPw, setSavingPw] = React.useState(false);

  async function onProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingProfile(true);
    const res = await updateProfile(new FormData(e.currentTarget));
    setSavingProfile(false);
    if (res.ok) {
      toast.success("Profile updated");
      router.refresh();
    } else toast.error(res.error ?? "Failed");
  }

  async function onPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setSavingPw(true);
    const res = await changePassword(new FormData(form));
    setSavingPw(false);
    if (res.ok) {
      toast.success("Password changed");
      form.reset();
    } else toast.error(res.error ?? "Failed");
  }

  return (
    <>
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input id="avatar" name="avatar" defaultValue={avatar} placeholder="https://…" />
            </div>
            <Button type="submit" disabled={savingProfile}>
              {savingProfile && <Loader2 className="animate-spin" />} Save profile
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" name="current" type="password" required autoComplete="current-password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next">New password</Label>
              <Input id="next" name="next" type="password" required autoComplete="new-password" />
            </div>
            <Button type="submit" disabled={savingPw}>
              {savingPw && <Loader2 className="animate-spin" />} Update password
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
