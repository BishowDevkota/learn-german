import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings, Flame, Zap, Gamepad2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icon";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import { ACHIEVEMENTS } from "@/lib/gamification";
import { formatNumber } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await connectDB();
  const user = await User.findById(session.user.id).lean();
  if (!user) redirect("/login");

  const unlocked = new Set(user.achievements.map((a) => a.key));

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
          <div className="grid size-20 place-items-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge>Level {user.level}</Badge>
              {user.role === "admin" && <Badge variant="secondary">Admin</Badge>}
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/settings"><Settings /> Edit</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-3 p-5"><Zap className="size-5 text-amber-500" /><div><p className="text-xl font-bold">{formatNumber(user.xp)}</p><p className="text-xs text-muted-foreground">Total XP</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-5"><Flame className="size-5 text-orange-500" /><div><p className="text-xl font-bold">{user.streak}</p><p className="text-xs text-muted-foreground">Day streak</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-5"><Gamepad2 className="size-5 text-sky-500" /><div><p className="text-xl font-bold">{formatNumber(user.gamesPlayed)}</p><p className="text-xs text-muted-foreground">Games played</p></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Achievements ({unlocked.size}/{ACHIEVEMENTS.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {ACHIEVEMENTS.map((a) => {
              const has = unlocked.has(a.key);
              return (
                <div key={a.key} className={`flex items-center gap-3 rounded-lg border p-3 ${has ? "" : "opacity-40"}`}>
                  <Icon name={a.icon} className="size-6 text-primary" />
                  <div className="min-w-0">
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                  </div>
                  {has && <Badge variant="success" className="ml-auto">Unlocked</Badge>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
