import { Card, CardContent } from "@/components/ui/card";

/** Shown by a game component when its content payload is empty. */
export function GameEmptyState({
  message = "No content yet for this game. Check back soon!",
}: {
  message?: string;
}) {
  return (
    <Card>
      <CardContent className="py-16 text-center text-muted-foreground">{message}</CardContent>
    </Card>
  );
}
