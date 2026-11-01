import { z } from "zod";

// Shared by the tRPC router and the task form, so both validate the same way.
export const title = z.string().trim().min(1);
// Blank descriptions are treated as missing.
export const description = z
  .string()
  .trim()
  .transform((s) => s || undefined);
