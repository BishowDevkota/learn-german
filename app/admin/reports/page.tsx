import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleBarChart } from "@/components/admin/bar-chart";
import { connectDB } from "@/lib/db";
import GameSession from "@/models/game-session";
import { GAMES } from "@/lib/games";

async function getReports() {
  await connectDB();
  const byGame = await GameSession.aggregate([
    { $group: { _id: "$gameSlug", plays: { $sum: 1 }, xp: { $sum: "$xpEarned" } } },
  ]);
  const map = new Map(byGame.map((b) => [b._id, b]));

  const plays = GAMES.map((g) => ({
    name: g.title.split(" ")[0],
    plays: map.get(g.slug)?.plays ?? 0,
  }));
  const totalXp = byGame.reduce((s, b) => s + b.xp, 0);
  return { plays, totalXp };
}

export default async function ReportsPage() {
  let data: { plays: { name: string; plays: number }[]; totalXp: number } = { plays: [], totalXp: 0 };
  try {
    data = await getReports();
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Play activity across all games.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Plays per game</CardTitle></CardHeader>
        <CardContent>
          {data.plays.some((p) => p.plays > 0) ? (
            <SimpleBarChart data={data.plays} xKey="name" barKey="plays" />
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">No play data yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
