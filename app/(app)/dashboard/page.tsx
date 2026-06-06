import Link from "next/link";
import { redirect } from "next/navigation";
import { Zap, TrendingUp, Flame, Gamepad2, Award, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icon";
import { WeeklyXpChart } from "@/components/dashboard/weekly-xp-chart";
import { GameCard } from "@/components/game/game-card";
import { Types } from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import GameSession from "@/models/game-session";
import { GAMES, getGame } from "@/lib/games";
import { levelProgress, ACHIEVEMENTS } from "@/lib/gamification";
import { formatNumber, formatRelativeTime } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

async function getData(userId: string) {
  await connectDB();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  const [user, recent, weekly, rank] = await Promise.all([
    User.findById(userId).lean(),
    GameSession.find({ userId }).sort({ createdAt: -1 }).limit(6).lean(),
    GameSession.aggregate([
      { $match: { userId: Types.ObjectId.createFromHexString(userId), createdAt: { $gte: weekAgo } } },
      { $group: { _id: { $dayOfWeek: "$createdAt" }, xp: { $sum: "$xpEarned" } } },
    ]),
    null,
  ]);

  if (!user) return null;

  const myRank = (await User.countDocuments({ xp: { $gt: user.xp } })) + 1;

  // Build last-7-days XP series.
  const weeklyMap = new Map<number, number>(weekly.map((w) => [w._id, w.xp]));
  const series: { day: string; xp: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    series.push({ day: DAYS[d.getDay()], xp: weeklyMap.get(d.getDay() + 1) ?? 0 });
  }

  return { user, recent, series, rank: myRank };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const data = await getData(session.user.id);
  if (!data) redirect("/login");

  const { user, recent, series, rank } = data;
  const progress = levelProgress(user.xp);
  const unlocked = new Set(user.achievements.map((a) => a.key));

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Welcome back, {user.name.split(" ")[0]} 👋</h1>
        <p className="text-muted-foreground">Here&apos;s your progress so far.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard label="Total XP" value={formatNumber(user.xp)} icon={Zap} accent="text-amber-500" />
        <StatCard label="Level" value={user.level} icon={TrendingUp} sub={`#${rank} globally`} />
        <StatCard label="Day Streak" value={user.streak} icon={Flame} accent="text-orange-500" />
        <StatCard label="Games Played" value={formatNumber(user.gamesPlayed)} icon={Gamepad2} accent="text-sky-500" />
        <StatCard label="Achievements" value={`${unlocked.size}/${ACHIEVEMENTS.length}`} icon={Award} accent="text-violet-500" />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Level {progress.level}</span>
            <span className="text-muted-foreground">{progress.xpIntoLevel} / {progress.xpForLevel} XP to level {progress.nextLevel}</span>
          </div>
          <Progress value={progress.percent} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Weekly XP</CardTitle></CardHeader>
          <CardContent><WeeklyXpChart data={series} /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Games</CardTitle></CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No games yet — go play one!</p>
            ) : (
              <ul className="space-y-3">
                {recent.map((s) => {
                  const game = getGame(s.gameSlug);
                  return (
                    <li key={String(s._id)} className="flex items-center gap-3 text-sm">
                      <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-foreground">
                        <Icon name={game?.icon ?? "Gamepad2"} className="size-4" />
                      </span>
                      <span className="flex-1 truncate">{game?.title ?? s.gameSlug}</span>
                      <span className="text-muted-foreground">+{s.xpEarned}</span>
                      <span className="hidden text-xs text-muted-foreground sm:inline">{formatRelativeTime(s.createdAt)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Achievements</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {ACHIEVEMENTS.map((a) => {
              const has = unlocked.has(a.key);
              return (
                <div key={a.key} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${has ? "" : "opacity-40"}`}>
                  <Icon name={a.icon} className="size-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{a.tier}</p>
                  </div>
                  {has && <Badge variant="success" className="ml-1">✓</Badge>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Recommended for you</h2>
          <Link href="/games" className="flex items-center gap-1 text-sm text-primary hover:underline">
            All games <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.slice(0, 3).map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      </div>
    </div>
  );
}
