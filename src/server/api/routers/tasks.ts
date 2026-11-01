import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { z } from "zod";

import { description, title } from "@/lib/schemas/task";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { type Task, tasks } from "@/server/store/tasks";

const PAGE_SIZE = 10;

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

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const task = tasks.find((t) => t.id === input.id);
      if (!task) throw notFound();

      return task;
    }),

  // Paginated per column (pending/completed) so each one can load more on its own.
  // The cursor is the id of the last task already loaded, which keeps pages stable
  // when tasks are created or removed in between requests.
  list: publicProcedure
    .input(z.object({ completed: z.boolean(), cursor: z.string().nullish() }))
    .query(({ input }) => {
      const filtered = tasks
        .filter((t) => t.completed === input.completed)
        .sort((a, b) =>
          input.completed
            ? (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0)
            : b.createdAt.getTime() - a.createdAt.getTime(),
        );

      let start = 0;
      if (input.cursor) {
        const index = filtered.findIndex((t) => t.id === input.cursor);
        if (index === -1)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid cursor",
          });
        start = index + 1;
      }

      const items = filtered.slice(start, start + PAGE_SIZE);
      const nextCursor =
        start + PAGE_SIZE < filtered.length ? items.at(-1)?.id : undefined;

      return { items, nextCursor, total: filtered.length };
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

      // undefined leaves a field untouched; description: null clears it.
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
