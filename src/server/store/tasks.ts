export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
}

// Next.js loads this module separately for the API route handler and for server
// components, so a plain module-level array would give each its own copy.
// Keeping it on globalThis makes both share the same in-memory list.
const globalForTasks = globalThis as unknown as { tasks?: Task[] };

export const tasks = (globalForTasks.tasks ??= []);
