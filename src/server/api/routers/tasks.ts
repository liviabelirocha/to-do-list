import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { type Task, tasks } from "@/server/store/tasks";

const title = z.string().trim().min(1);
const description = z
  .string()
  .trim()
  .transform((s) => s || undefined);

const notFound = () =>
  new TRPCError({ code: "NOT_FOUND", message: "Task not found" });

export const tasksRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ title, description: description.optional() }))
    .mutation(({ input }) => {
      const task: Task = {
        id: randomUUID(),
        title: input.title,
        description: input.description,
        completed: false,
        createdAt: new Date(),
      };
      tasks.push(task);
      return task;
    }),

  list: publicProcedure.query(() => {
    return [...tasks].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: title.optional(),
        description: description.nullable().optional(),
      }),
    )
    .mutation(({ input }) => {
      const task = tasks.find((t) => t.id === input.id);
      if (!task) throw notFound();

      if (input.title !== undefined) task.title = input.title;
      if (input.description === null) task.description = undefined;
      else if (input.description !== undefined)
        task.description = input.description;

      return task;
    }),

  toggle: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const task = tasks.find((t) => t.id === input.id);
      if (!task) throw notFound();

      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date() : undefined;

      return task;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const index = tasks.findIndex((t) => t.id === input.id);
      if (index === -1) throw notFound();

      tasks.splice(index, 1);
      return { id: input.id };
    }),
});
