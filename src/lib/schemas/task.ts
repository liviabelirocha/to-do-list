import { z } from "zod";

export const title = z.string().trim().min(1);
export const description = z
  .string()
  .trim()
  .transform((s) => s || undefined);
