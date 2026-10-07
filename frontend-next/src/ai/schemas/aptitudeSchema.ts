import { z } from "zod";

export const aptitudeSchema = z.object({
  track: z.enum(["WEB", "LOGIC", "BALANCED"]).nullable(),
  summary: z.string(),
  planets: z.array(z.object({
    planet: z.enum(["MARS", "VENUS", "MERCURY", "JUPITER", "SATURN", "EARTH"]),
    affinity: z.number().int().min(0).max(100),
    reason: z.string()
  })).length(6)
});

export type AptitudeResult = z.infer<typeof aptitudeSchema>;
