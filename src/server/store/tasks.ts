export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
}

const globalForTasks = globalThis as unknown as { tasks?: Task[] };

export const tasks = (globalForTasks.tasks ??= []);
