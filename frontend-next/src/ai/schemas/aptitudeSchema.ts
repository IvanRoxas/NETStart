import { z } from "zod";

export const aptitudeSchema = z.object({
  summary: z.string(),
  advice: z.string(),
});

export type AptitudeResult = z.infer<typeof aptitudeSchema>;
