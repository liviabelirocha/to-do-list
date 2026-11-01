import { Board } from "@/app/(board)/_components/board";
import { api, HydrateClient } from "@/trpc/server";

// The board lives in the layout so the create/edit routes render only their modal
// on top of it, and the board stays mounted while navigating between them.
export default function BoardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Prefetch the first page of each column on the server; HydrateClient sends it to
  // the client cache so the board renders with data on the first paint (SSR).
  void api.tasks.list.prefetchInfinite({ completed: false });
  void api.tasks.list.prefetchInfinite({ completed: true });

  return (
    <HydrateClient>
      <Board />
      {children}
    </HydrateClient>
  );
}
