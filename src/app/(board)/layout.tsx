import { Board } from "@/app/(board)/_components/board";
import { api, HydrateClient } from "@/trpc/server";

export default function BoardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  void api.tasks.list.prefetch();

  return (
    <HydrateClient>
      <Board />
      {children}
    </HydrateClient>
  );
}
