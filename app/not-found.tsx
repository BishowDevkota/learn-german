import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <p className="text-6xl font-extrabold text-primary">404</p>
      <h1 className="text-2xl font-bold">Seite nicht gefunden</h1>
      <p className="text-muted-foreground">This page doesn&apos;t exist (yet).</p>
      <Button asChild><Link href="/">Back home</Link></Button>
    </div>
  );
}
