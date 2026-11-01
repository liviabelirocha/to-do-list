"use client";

import { useRouter } from "next/navigation";

import { Modal } from "@/app/_components/modal";

// The create/edit pages are server components and can't pass functions to client
// components, so this client wrapper provides Modal's onClose for these routes.
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
