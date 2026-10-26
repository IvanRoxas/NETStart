import { z } from "zod";

export const aptitudeSchema = z.object({
  track: z.enum(["WEB", "LOGIC", "BALANCED"]).nullable(),
  summary: z.string(),
  advice: z.string(),
  planets: z.array(
    z.object({
      planet: z.preprocess(
        (val) => (typeof val === "string" ? val.toUpperCase().trim() : val),
        z.enum(["MARS", "VENUS", "MERCURY", "JUPITER", "SATURN", "EARTH"])
      ),
      affinity: z.number().min(0).max(100).transform((v) => Math.round(v)),
      reason: z.string()
    })
  ).length(6)
});

export type AptitudeResult = z.infer<typeof aptitudeSchema>;
