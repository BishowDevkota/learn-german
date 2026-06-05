import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icon";
import { ACHIEVEMENTS, type BadgeTier } from "@/lib/gamification";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import { cn } from "@/lib/utils";

const TIER_STYLES: Record<BadgeTier, string> = {
  bronze: "from-amber-700 to-amber-500",
  silver: "from-zinc-400 to-zinc-300",
  gold: "from-yellow-500 to-amber-400",
  platinum: "from-sky-400 to-indigo-400",
};

async function getUnlockCounts(): Promise<Record<string, number>> {
  try {
    await connectDB();
    const agg = await User.aggregate([
      { $unwind: "$achievements" },
      { $group: { _id: "$achievements.key", count: { $sum: 1 } } },
    ]);
    return Object.fromEntries(agg.map((a) => [a._id, a.count]));
  } catch {
    return {};
  }
}

export default async function AdminAchievementsPage() {
  const counts = await getUnlockCounts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">Badges users can earn through play.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a) => (
          <Card key={a.key}>
            <CardContent className="flex gap-4 p-5">
              <div className={cn("grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white", TIER_STYLES[a.tier])}>
                <Icon name={a.icon} className="size-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{a.title}</p>
                  <Badge variant="outline" className="capitalize">{a.tier}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{a.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  +{a.xpReward} XP · unlocked by {counts[a.key] ?? 0} user(s)
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
