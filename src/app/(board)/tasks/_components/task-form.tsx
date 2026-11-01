"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { description, title } from "@/lib/schemas/task";
import { api, type RouterOutputs } from "@/trpc/react";

// Same field schemas the backend validates with, so the form can't send anything the
// server would reject.
const schema = z.object({ title, description: description.optional() });

export function TaskForm({ task }: { task?: RouterOutputs["tasks"]["get"] }) {
  const router = useRouter();
  const utils = api.useUtils();

  // No optimistic updates: the server is the only source of truth, so the list is
  // refetched before closing the modal instead of being patched on the client.
  const callbacks = (message: string) => ({
    onSuccess: async () => {
      toast.success(message);
      await utils.tasks.list.invalidate();
      router.push("/");
    },
    onError: (error: { message: string }) => toast.error(error.message),
  });

  const create = api.tasks.create.useMutation(callbacks("Tarefa criada"));
  const update = api.tasks.update.useMutation(callbacks("Tarefa atualizada"));
  const isPending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
    },
  });

  const onSubmit = (values: z.output<typeof schema>) => {
    if (task) {
      // An emptied description field becomes undefined after parsing, which update
      // reads as "leave unchanged"; null tells it to clear the description.
      update.mutate({
        id: task.id,
        title: values.title,
        description: values.description ?? null,
      });
    } else {
      create.mutate(values);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Título
        <input
          {...register("title")}
          autoFocus
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
        {errors.title && (
          <span className="text-red-600">Título é obrigatório</span>
        )}
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Descrição
        <textarea
          {...register("description")}
          rows={4}
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-md px-4 py-2 text-sm hover:bg-neutral-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50"
        >
          {isPending ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
