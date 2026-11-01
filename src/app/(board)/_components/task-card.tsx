"use client";

import { useDraggable } from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "sonner";

import { api, type RouterOutputs } from "@/trpc/react";

type Task = RouterOutputs["tasks"]["get"];

const formatDate = (date: Date) =>
  date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

export function TaskCard({ task }: { task: Task }) {
  const router = useRouter();
  const utils = api.useUtils();
  // Callbacks live on useMutation rather than on mutate(): they still run if the
  // card unmounts before the response arrives.
  const remove = api.tasks.delete.useMutation({
    onSuccess: async () => {
      toast.success("Tarefa excluída");
      await utils.tasks.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // The card itself stays in place while dragging; Board renders a copy in a
  // DragOverlay so it isn't clipped by the column's scroll container.
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const closeMenu = () => {
    setMenuOpen(false);
    setConfirming(false);
  };

  const onDelete = () => {
    closeMenu();
    remove.mutate({ id: task.id });
  };

  return (
    <TaskContent
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      task={task}
      onClick={() => router.push(`/tasks/${task.id}/edit`)}
      className={isDragging ? "opacity-40" : ""}
    >
      <div
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Ações"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded px-2 leading-none text-neutral-500 hover:bg-neutral-100"
        >
          ⋯
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={closeMenu} />
            <div className="absolute top-9 right-2 z-20 rounded-md border border-neutral-200 bg-white py-1 shadow-md">
              <button
                type="button"
                onClick={confirming ? onDelete : () => setConfirming(true)}
                className="w-full px-4 py-1 text-left text-sm text-red-600 hover:bg-red-50"
              >
                {confirming ? "Confirmar?" : "Excluir"}
              </button>
            </div>
          </>
        )}
      </div>
    </TaskContent>
  );
}

export function TaskContent({
  task,
  children,
  className = "",
  ...props
}: {
  task: Task;
  children?: React.ReactNode;
} & React.ComponentPropsWithRef<"article">) {
  return (
    <article
      {...props}
      className={`relative cursor-pointer rounded-md border border-neutral-200 bg-white p-3 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium break-words">{task.title}</h3>
        {children}
      </div>
      {task.description && (
        <p className="mt-1 text-sm whitespace-pre-wrap text-neutral-600">
          {task.description}
        </p>
      )}
      <p className="mt-2 text-xs text-neutral-500">
        Criada em {formatDate(task.createdAt)}
      </p>
      {task.completedAt && (
        <p className="text-xs text-neutral-500">
          Concluída em {formatDate(task.completedAt)}
        </p>
      )}
    </article>
  );
}
