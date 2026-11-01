"use client";

import { useDroppable } from "@dnd-kit/core";
import { useEffect, useRef } from "react";

import { TaskCard } from "@/app/(board)/_components/task-card";
import { api } from "@/trpc/react";

export function Column({
  title,
  completed,
}: {
  title: string;
  completed: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: completed ? "completed" : "pending",
  });

  const [{ pages }, { hasNextPage, fetchNextPage, isFetchingNextPage }] =
    api.tasks.list.useSuspenseInfiniteQuery(
      { completed },
      { getNextPageParam: (page) => page.nextCursor },
    );
  const tasks = pages.flatMap((page) => page.items);
  const total = pages[0]?.total ?? 0;

  // An invisible sentinel after the last card: when it scrolls into view, load the
  // next page. The observer is recreated after each fetch, so if the sentinel is
  // still visible (short pages, tall screen) it keeps loading until it isn't.
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sentinel.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) void fetchNextPage();
    });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-0 flex-col gap-3 rounded-lg p-4 transition-colors ${isOver ? "bg-neutral-200" : "bg-neutral-100"}`}
    >
      <h2 className="font-semibold">
        {title} <span className="text-neutral-500">({total})</span>
      </h2>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        {tasks.length === 0 && (
          <p className="text-sm text-neutral-500">Nenhuma tarefa</p>
        )}
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        <div ref={sentinel} />
        {isFetchingNextPage && (
          <p className="text-center text-sm text-neutral-500">Carregando...</p>
        )}
      </div>
    </section>
  );
}
