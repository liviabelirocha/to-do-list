"use client";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import Link from "next/link";
import { useId } from "react";
import { toast } from "sonner";

import { Column } from "@/app/(board)/_components/column";
import { api } from "@/trpc/react";

export function Board() {
  const [tasks] = api.tasks.list.useSuspenseQuery();
  const utils = api.useUtils();
  const toggle = api.tasks.toggle.useMutation({
    onSuccess: () => utils.tasks.list.invalidate(),
    onError: (error) => toast.error(error.message),
  });
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks
    .filter((t) => t.completed)
    .sort(
      (a, b) =>
        (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0),
    );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const task = tasks.find((t) => t.id === active.id);
    if (!task || task.completed === (over.id === "completed")) return;

    toggle.mutate({ id: task.id });
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tarefas</h1>
        <Link
          href="/tasks/new"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80"
        >
          Nova tarefa
        </Link>
      </header>

      <DndContext id={dndId} sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
          <Column id="pending" title="Pendentes" tasks={pending} />
          <Column id="completed" title="Concluídas" tasks={completed} />
        </div>
      </DndContext>
    </main>
  );
}
