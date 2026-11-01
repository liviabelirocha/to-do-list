"use client";

import { useDraggable } from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "sonner";

import { api, type RouterOutputs } from "@/trpc/react";

const formatDate = (date: Date) =>
  date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

export function TaskCard({
  task,
}: {
  task: RouterOutputs["tasks"]["list"][number];
}) {
  const router = useRouter();
  const utils = api.useUtils();
  const remove = api.tasks.delete.useMutation({
    onSuccess: async () => {
      toast.success("Tarefa excluída");
      await utils.tasks.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });

  const closeMenu = () => {
    setMenuOpen(false);
    setConfirming(false);
  };

  const onDelete = () => {
    closeMenu();
    remove.mutate({ id: task.id });
  };

  return (
    <article
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => router.push(`/tasks/${task.id}/edit`)}
      style={
        transform
          ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
          : undefined
      }
      className={`relative cursor-pointer rounded-md border border-neutral-200 bg-white p-3 shadow-sm ${isDragging ? "z-10 shadow-lg" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium break-words">{task.title}</h3>
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
