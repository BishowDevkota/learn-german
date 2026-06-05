import type { ComponentType } from "react";

export interface GameComponentProps {
  slug: string;
  difficulty: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: Record<string, any>;
  isAuthed: boolean;
}

export type GameComponent = ComponentType<GameComponentProps>;

/** All 97 game slugs have an implementation — the page always renders the GameLoader. */
export function isGameImplemented(_slug: string): boolean {
  return true;
}
