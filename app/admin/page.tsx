import { Users, UserCheck, Gamepad2, Zap } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import GameSession from "@/models/game-session";
import { GAMES, getGame } from "@/lib/games";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import { Icon } from "@/components/icon";

async function getStats() {
  await connectDB();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [totalUsers, activeUserIds, totalSessions, xpAgg, recent] = await Promise.all([
    User.countDocuments(),
    GameSession.distinct("userId", { createdAt: { $gte: weekAgo } }),
    GameSession.countDocuments(),
    User.aggregate([{ $group: { _id: null, xp: { $sum: "$xp" } } }]),
    GameSession.find().sort({ createdAt: -1 }).limit(8).populate("userId", "name").lean(),
  ]);

  return {
    totalUsers,
    activeUsers: activeUserIds.length,
    totalSessions,
    totalXp: xpAgg[0]?.xp ?? 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recent: recent as any[],
  };
}

export default async function AdminDashboard() {
  let stats;
  try {
    stats = await getStats();
  } catch {
    stats = { totalUsers: 0, activeUsers: 0, totalSessions: 0, totalXp: 0, recent: [] };
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Platform overview at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={formatNumber(stats.totalUsers)} icon={Users} />
        <StatCard label="Active (7d)" value={formatNumber(stats.activeUsers)} icon={UserCheck} accent="text-[hsl(var(--success))]" />
        <StatCard label="Games Played" value={formatNumber(stats.totalSessions)} icon={Gamepad2} accent="text-sky-500" />
        <StatCard label="Total XP Earned" value={formatNumber(stats.totalXp)} icon={Zap} accent="text-amber-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            {stats.recent.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ul className="space-y-3">
                {stats.recent.map((s) => {
                  const game = getGame(s.gameSlug);
                  return (
                    <li key={String(s._id)} className="flex items-center gap-3 text-sm">
                      <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-foreground">
                        <Icon name={game?.icon ?? "Gamepad2"} className="size-4" />
                      </span>
                      <span className="flex-1">
                        <span className="font-medium">{s.userId?.name ?? "A user"}</span>{" "}
                        played {game?.title ?? s.gameSlug}
                      </span>
                      <span className="text-muted-foreground">+{s.xpEarned} XP</span>
                      <span className="hidden text-xs text-muted-foreground sm:inline">{formatRelativeTime(s.createdAt)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Games</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {GAMES.length} games are configured. Manage their content from the{" "}
              <a href="/admin/games" className="font-medium text-primary hover:underline">Games</a> section.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
