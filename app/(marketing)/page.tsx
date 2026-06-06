import Link from "next/link";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { CATEGORIES, gameCountByCategory } from "@/lib/games";

export default function HomePage() {
  const counts = gameCountByCategory();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:max-w-6xl md:py-12">
      {/* Mobile app-style greeting */}
      <div className="mb-6 md:mb-10">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-4xl">
          Learn German{" "}
          <span className="bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">
            through play
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground md:mt-2 md:text-base">
          Pick a category and start your session.
        </p>
      </div>

      {/* Category grid — 2 col on mobile, 3 col on lg */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
        {CATEGORIES.map((c) => (
          <Link key={c.key} href={`/games/${c.key}`} className="group block">
            <div className="flex h-full flex-col gap-3 rounded-2xl border bg-card p-4 transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md md:flex-row md:items-start md:gap-4 md:rounded-xl md:p-5">
              {/* Icon */}
              <div
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white md:size-12",
                  c.gradient
                )}
              >
                <Icon name={c.icon} className="size-6" />
              </div>
              {/* Text */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-sm font-semibold leading-snug group-hover:text-primary md:text-base">
                    {c.title}
                  </h3>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                    {counts[c.key] ?? 0}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground md:text-sm">
                  {c.blurb}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
