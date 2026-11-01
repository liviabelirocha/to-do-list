import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";

import { TaskForm } from "@/app/(board)/tasks/_components/task-form";
import { TaskModal } from "@/app/(board)/tasks/_components/task-modal";
import { api } from "@/trpc/server";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Loaded on the server so the form opens already filled; an unknown id renders
  // the 404 page instead of an empty form.
  const task = await api.tasks.get({ id }).catch((error) => {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") notFound();
    throw error;
  });

  return (
    <TaskModal title="Editar tarefa">
      <TaskForm task={task} />
    </TaskModal>
  );
}
