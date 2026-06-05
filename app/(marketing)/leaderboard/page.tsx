import Link from "next/link";
import type { Metadata } from "next";
import { Crown, Medal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import GameSession from "@/models/game-session";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Leaderboard" };

type Range = "global" | "weekly" | "monthly";
const RANGES: { key: Range; label: string }[] = [
  { key: "global", label: "All Time" },
  { key: "weekly", label: "This Week" },
  { key: "monthly", label: "This Month" },
];

interface Row {
  id: string;
  name: string;
  xp: number;
  level?: number;
}

async function getRows(range: Range): Promise<Row[]> {
  await connectDB();

  if (range === "global") {
    const users = await User.find().sort({ xp: -1 }).limit(50).lean();
    return users.map((u) => ({ id: String(u._id), name: u.name, xp: u.xp, level: u.level }));
  }

  const since = new Date();
  if (range === "weekly") since.setDate(since.getDate() - 7);
  else since.setMonth(since.getMonth() - 1);

  const agg = await GameSession.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: "$userId", xp: { $sum: "$xpEarned" } } },
    { $sort: { xp: -1 } },
    { $limit: 50 },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    { $project: { xp: 1, name: "$user.name", level: "$user.level" } },
  ]);
  return agg.map((a) => ({ id: String(a._id), name: a.name, xp: a.xp, level: a.level }));
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rawRange } = await searchParams;
  const range: Range = RANGES.some((r) => r.key === rawRange) ? (rawRange as Range) : "global";

  let rows: Row[] = [];
  try {
    rows = await getRows(range);
  } catch {
    rows = [];
  }
  const session = await auth();
  const myId = session?.user?.id;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="mt-2 text-muted-foreground">See how you stack up against other learners.</p>
      </div>

      <div className="mx-auto mt-6 flex w-fit gap-1 rounded-lg border bg-card p-1">
        {RANGES.map((r) => (
          <Link
            key={r.key}
            href={`/leaderboard?range=${r.key}`}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              range === r.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {r.label}
          </Link>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="p-2">
          {rows.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No data yet — be the first to play!</p>
          ) : (
            <ol className="divide-y">
              {rows.map((row, i) => {
                const rank = i + 1;
                const isMe = row.id === myId;
                return (
                  <li
                    key={row.id}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3",
                      isMe && "rounded-lg bg-accent"
                    )}
                  >
                    <span className="grid w-8 shrink-0 place-items-center font-bold">
                      {rank === 1 ? <Crown className="size-5 text-yellow-500" /> : rank <= 3 ? <Medal className={cn("size-5", rank === 2 ? "text-zinc-400" : "text-amber-700")} /> : rank}
                    </span>
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      {row.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 truncate font-medium">
                      {row.name} {isMe && <span className="text-xs text-muted-foreground">(you)</span>}
                    </span>
                    {typeof row.level === "number" && <Badge variant="secondary">Lvl {row.level}</Badge>}
                    <span className="w-20 text-right font-semibold tabular-nums">{row.xp.toLocaleString()} XP</span>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
