import { z } from "zod";

export const evaluateSchema = z.object({
  verdict: z.enum(["correct", "partial", "incorrect"]),
  error_type: z.enum(["syntax", "logic", "wrong_output", "missing_step", "none"]),
  concept_tag: z.string(),
  hint_id: z.string().nullable(),
  same_mistake_as_previous: z.boolean(),
  confidence: z.enum(["low", "medium", "high"]),
});

export type EvaluateResult = z.infer<typeof evaluateSchema>;
