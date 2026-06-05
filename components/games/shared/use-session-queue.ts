"use client";

import * as React from "react";
import { shuffle } from "@/lib/utils";

export const SESSION_SIZE = 10;

export interface SessionQueue<T> {
  /** The items for the current session (up to SESSION_SIZE). */
  sessionItems: T[];
  /** Current session number (1-based). */
  session: number;
  /** Total sessions in the pool (pool.length / SESSION_SIZE, rounded up). */
  totalSessions: number;
  /** Total items in the full pool. */
  poolSize: number;
  /** How many items have been shown so far (across all sessions this cycle). */
  shownSoFar: number;
  /** Advance to the next session. Reshuffles and cycles when the pool is exhausted. */
  nextSession: () => void;
}

/**
 * Manages a shuffled, non-repeating session queue.
 *
 * Rules:
 * - Questions are shuffled once at mount.
 * - Each session returns the next SESSION_SIZE items from the shuffled queue.
 * - No question repeats until the entire pool has been shown.
 * - When the pool is exhausted (all sessions played), it reshuffles and cycles back.
 * - If the admin adds/removes items the pool is rebuilt.
 */
export function useSessionQueue<T>(allItems: T[], sessionSize = SESSION_SIZE): SessionQueue<T> {
  const [state, setState] = React.useState(() => ({
    shuffled: shuffle([...allItems]),
    offset: 0,
  }));

  // Rebuild the queue if the pool grows or shrinks (admin added/removed items).
  const prevLen = React.useRef(allItems.length);
  React.useEffect(() => {
    if (allItems.length !== prevLen.current && allItems.length > 0) {
      prevLen.current = allItems.length;
      setState({ shuffled: shuffle([...allItems]), offset: 0 });
    }
  }, [allItems.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const { shuffled, offset } = state;

  const sessionItems = React.useMemo(
    () => shuffled.slice(offset, offset + sessionSize),
    [shuffled, offset, sessionSize]
  );

  const session = Math.floor(offset / sessionSize) + 1;
  const totalSessions = Math.max(1, Math.ceil(allItems.length / sessionSize));
  const shownSoFar = Math.min(offset + sessionSize, shuffled.length);

  const nextSession = React.useCallback(() => {
    setState((prev) => {
      const newOffset = prev.offset + sessionSize;
      if (newOffset >= prev.shuffled.length) {
        // Pool exhausted — reshuffle and cycle back to start.
        return { shuffled: shuffle([...allItems]), offset: 0 };
      }
      return { ...prev, offset: newOffset };
    });
  }, [allItems, sessionSize]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    sessionItems,
    session,
    totalSessions,
    poolSize: allItems.length,
    shownSoFar,
    nextSession,
  };
}
