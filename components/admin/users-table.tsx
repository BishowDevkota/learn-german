"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { setUserRole, deleteUser } from "@/app/admin/actions";

interface U {
  _id: string;
  name: string;
  email: string;
  role: string;
  xp: number;
  level: number;
}

export function UsersTable({ users }: { users: U[] }) {
  const router = useRouter();

  async function toggleRole(u: U) {
    const next = u.role === "admin" ? "user" : "admin";
    const res = await setUserRole(u._id, next);
    if (res.ok) {
      toast.success(`${u.name} is now ${next}`);
      router.refresh();
    } else toast.error(res.error ?? "Failed");
  }

  async function remove(u: U) {
    if (!confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    const res = await deleteUser(u._id);
    if (res.ok) {
      toast.success("User deleted");
      router.refresh();
    } else toast.error(res.error ?? "Failed");
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Level / XP</TableHead>
            <TableHead className="w-32 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="py-12 text-center text-muted-foreground">No users.</TableCell></TableRow>
          ) : (
            users.map((u) => (
              <TableRow key={u._id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">Lvl {u.level} · {u.xp.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => toggleRole(u)} aria-label="Toggle role" title={u.role === "admin" ? "Demote to user" : "Promote to admin"}>
                      {u.role === "admin" ? <ShieldOff className="size-4" /> : <ShieldCheck className="size-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(u)} aria-label="Delete">
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
