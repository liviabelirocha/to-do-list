"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import Link from "next/link";
import { useId, useState } from "react";
import { toast } from "sonner";

import { Column } from "@/app/(board)/_components/column";
import { TaskContent } from "@/app/(board)/_components/task-card";
import { api, type RouterOutputs } from "@/trpc/react";

type Task = RouterOutputs["tasks"]["get"];

export function Board() {
  const utils = api.useUtils();
  const toggle = api.tasks.toggle.useMutation({
    onSuccess: () => utils.tasks.list.invalidate(),
    onError: (error) => toast.error(error.message),
  });
  const [dragging, setDragging] = useState<Task | null>(null);

  // dnd-kit generates ids with an internal counter that differs between the server
  // render and the client, causing a hydration mismatch; a stable id avoids it.
  const dndId = useId();
  // Only start dragging after 5px of movement, so a plain click still opens the task.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const onDragStart = ({ active }: DragStartEvent) => {
    setDragging(active.data.current?.task as Task);
  };

  const onDragEnd = ({ over }: DragEndEvent) => {
    setDragging(null);
    if (!over || !dragging) return;
    if (dragging.completed === (over.id === "completed")) return;

    toggle.mutate({ id: dragging.id });
  };

  return (
    <main className="mx-auto flex h-screen max-w-5xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tarefas</h1>
        <Link
          href="/tasks/new"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80"
        >
          Nova tarefa
        </Link>
      </header>

      <DndContext
        id={dndId}
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setDragging(null)}
      >
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2">
          <Column title="Pendentes" completed={false} />
          <Column title="Concluídas" completed />
        </div>
        <DragOverlay>
          {dragging && <TaskContent task={dragging} className="shadow-lg" />}
        </DragOverlay>
      </DndContext>
    </main>
  );
}
