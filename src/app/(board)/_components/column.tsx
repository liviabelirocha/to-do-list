"use client";

import { useDroppable } from "@dnd-kit/core";

import { TaskCard } from "@/app/(board)/_components/task-card";
import { type RouterOutputs } from "@/trpc/react";

export function Column({
  id,
  title,
  tasks,
}: {
  id: string;
  title: string;
  tasks: RouterOutputs["tasks"]["list"];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <section
      ref={setNodeRef}
      className={`flex flex-col gap-3 rounded-lg p-4 transition-colors ${isOver ? "bg-neutral-200" : "bg-neutral-100"}`}
    >
      <h2 className="font-semibold">
        {title} <span className="text-neutral-500">({tasks.length})</span>
      </h2>
      {tasks.length === 0 && (
        <p className="text-sm text-neutral-500">Nenhuma tarefa</p>
      )}
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </section>
  );
}
