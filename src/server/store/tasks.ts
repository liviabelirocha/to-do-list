export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
}

export const tasks: Task[] = [];
