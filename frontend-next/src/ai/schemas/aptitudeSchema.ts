import { z } from "zod";

export const aptitudeSchema = z.object({
  track: z.enum(["WEB", "LOGIC", "BALANCED"]).nullable().optional(),
  summary: z.string(),
  advice: z.string(),
  recommendedFirstPlanet: z.preprocess(
    (val) => (typeof val === "string" ? val.toUpperCase().trim() : val),
    z.enum(["MARS", "VENUS", "MERCURY", "JUPITER", "SATURN", "EARTH"])
  ).optional(),
  overrideReason: z.string().optional(),
  planets: z.array(
    z.object({
      planet: z.preprocess(
        (val) => (typeof val === "string" ? val.toUpperCase().trim() : val),
        z.enum(["MARS", "VENUS", "MERCURY", "JUPITER", "SATURN", "EARTH"])
      ),
      affinity: z.number().min(0).max(100).transform((v) => Math.round(v)),
      reason: z.string()
    })
  ).length(6).optional(),
  aiOverride: z.object({
    applied: z.boolean(),
    planet: z.string().optional(),
    reason: z.string().optional(),
  }).optional(),
});

export type AptitudeResult = z.infer<typeof aptitudeSchema>;
