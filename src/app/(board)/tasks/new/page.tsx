import { TaskForm } from "@/app/(board)/tasks/_components/task-form";
import { TaskModal } from "@/app/(board)/tasks/_components/task-modal";

export default function NewTaskPage() {
  return (
    <TaskModal title="Nova tarefa">
      <TaskForm />
    </TaskModal>
  );
}
