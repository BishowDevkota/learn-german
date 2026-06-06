import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />;
}

export function HomePageSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:max-w-6xl md:py-12">
      <div className="mb-6 space-y-2 md:mb-10">
        <Bone className="h-8 w-56 md:h-10 md:w-72" />
        <Bone className="h-4 w-40" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex h-28 flex-col gap-3 rounded-2xl border bg-card p-4 md:flex-row md:h-24">
            <Bone className="size-12 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-3/4" />
              <Bone className="h-3 w-full" />
              <Bone className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GamesPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="mb-8 space-y-2">
        <Bone className="h-8 w-40" />
        <Bone className="h-4 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 rounded-xl border bg-card p-5">
            <Bone className="size-12 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-1/2" />
              <Bone className="h-3 w-full" />
              <Bone className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoryPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="mb-8 flex items-center gap-4">
        <Bone className="size-14 rounded-2xl" />
        <div className="space-y-2">
          <Bone className="h-7 w-40" />
          <Bone className="h-4 w-56" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Bone className="size-10 rounded-lg" />
              <Bone className="h-4 w-32" />
            </div>
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-4/5" />
            <Bone className="h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GamePageSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Bone className="size-12 rounded-xl" />
        <div className="space-y-2">
          <Bone className="h-6 w-48" />
          <Bone className="h-4 w-32" />
        </div>
      </div>
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <Bone className="h-5 w-3/4 mx-auto" />
        <Bone className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Bone key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="space-y-1">
        <Bone className="h-8 w-56" />
        <Bone className="h-4 w-40" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Bone key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Bone className="h-16 rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Bone className="h-56 rounded-xl lg:col-span-2" />
        <Bone className="h-56 rounded-xl" />
      </div>
    </div>
  );
}
