"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Eye, EyeOff, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DIFFICULTIES } from "@/lib/validations";
import { toggleGameActive } from "@/app/admin/games/actions";

interface Row {
  slug: string;
  title: string;
  category: string;
  categoryTitle: string;
  difficulty: string;
  isActive: boolean;
  items: number;
}

export function GamesTable({
  rows,
  categories,
}: {
  rows: Row[];
  categories: { key: string; title: string }[];
}) {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState("");
  const [diff, setDiff] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [busy, setBusy] = React.useState<string | null>(null);

  const filtered = rows.filter((r) => {
    if (q && !r.title.toLowerCase().includes(q.toLowerCase())) return false;
    if (cat && r.category !== cat) return false;
    if (diff && r.difficulty !== diff) return false;
    if (status === "active" && !r.isActive) return false;
    if (status === "inactive" && r.isActive) return false;
    return true;
  });

  async function toggle(r: Row) {
    setBusy(r.slug);
    const res = await toggleGameActive(r.slug, !r.isActive);
    setBusy(null);
    if (res.ok) {
      toast.success(`${r.title} ${r.isActive ? "hidden" : "published"}`);
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed");
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters — stack on mobile */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <div className="relative flex-1 min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search games…" className="pl-9" />
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-2">
          <Select value={cat} onChange={(e) => setCat(e.target.value)} className="text-sm">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.key} value={c.key}>{c.title}</option>)}
          </Select>
          <Select value={diff} onChange={(e) => setDiff(e.target.value)} className="text-sm">
            <option value="">All levels</option>
            {DIFFICULTIES.map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="text-sm">
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} of {rows.length} games</p>

      {/* Mobile card list (hidden on md+) */}
      <div className="space-y-2 md:hidden">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No games match.</p>
        ) : filtered.map((r) => (
          <div key={r.slug} className="flex items-center gap-3 rounded-xl border bg-card p-3">
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-sm">{r.title}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground truncate">{r.categoryTitle}</span>
                <Badge variant="secondary" className="text-xs capitalize">{r.difficulty}</Badge>
                <Badge variant={r.isActive ? "success" : "secondary"} className="text-xs">{r.isActive ? "Active" : "Off"}</Badge>
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="ghost" size="icon" onClick={() => toggle(r)} disabled={busy === r.slug} className="size-9" aria-label="Toggle">
                {r.isActive ? <Eye className="size-4" /> : <EyeOff className="size-4 text-muted-foreground" />}
              </Button>
              <Button asChild variant="ghost" size="icon" className="size-9" aria-label="Edit">
                <Link href={`/admin/games/${r.slug}`}><Pencil className="size-4" /></Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table (hidden on mobile) */}
      <div className="hidden rounded-xl border md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Game</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No games match.</TableCell></TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.slug}>
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell className="text-muted-foreground">{r.categoryTitle}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{r.difficulty}</Badge></TableCell>
                    <TableCell className="text-right tabular-nums">{r.items}</TableCell>
                    <TableCell>
                      <Badge variant={r.isActive ? "success" : "secondary"}>{r.isActive ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => toggle(r)} disabled={busy === r.slug} title={r.isActive ? "Hide" : "Publish"} aria-label="Toggle active">
                          {r.isActive ? <Eye className="size-4" /> : <EyeOff className="size-4 text-muted-foreground" />}
                        </Button>
                        <Button asChild variant="ghost" size="icon" title="Edit content" aria-label="Edit">
                          <Link href={`/admin/games/${r.slug}`}><Pencil className="size-4" /></Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
