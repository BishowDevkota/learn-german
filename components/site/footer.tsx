import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} LinguaQuest. Learn German, the fun way.</p>
        <nav className="flex gap-4">
          <Link href="/games" className="hover:text-foreground">Games</Link>
          <Link href="/leaderboard" className="hover:text-foreground">Leaderboard</Link>
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/contact" className="hover:text-foreground">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
