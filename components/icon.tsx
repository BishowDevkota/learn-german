import * as Icons from "lucide-react";
import type { LucideProps } from "lucide-react";

/**
 * Renders a lucide icon by its string name (icon names are stored in the
 * game registry and DB). Falls back to a generic icon if not found.
 */
export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  const Fallback = Icons.Gamepad2;
  const Resolved = Cmp ?? Fallback;
  return <Resolved {...props} />;
}
