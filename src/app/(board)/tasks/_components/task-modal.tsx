"use client";

import { useRouter } from "next/navigation";

import { Modal } from "@/app/_components/modal";

export function TaskModal({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <Modal title={title} onClose={() => router.push("/")}>
      {children}
    </Modal>
  );
}
