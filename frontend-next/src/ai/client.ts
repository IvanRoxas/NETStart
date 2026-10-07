import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { z } from "zod";

const aiMockEnabled = process.env.AI_MOCK === "true";

if (process.env.NODE_ENV === "production" && aiMockEnabled) {
  throw new Error("AI_MOCK cannot be true in production");
}

export type AISource = "gemini" | "mock" | "fallback";

function getFallbackReason(error: unknown): string {
  if (!error) return "unknown";
  if (error instanceof z.ZodError) {
    const fields = error.issues.map((issue) => issue.path.join(".")).filter(Boolean);
    return `Zod validation error: missing/invalid fields [${fields.length > 0 ? fields.join(", ") : "root"}]`;
  }
  if (error instanceof SyntaxError) {
    return "invalid JSON in model response";
  }

  const errStr = String(error);
  const errMsg = (error as any)?.message ? String((error as any).message) : "";
  const errStatus = (error as any)?.status || (error as any)?.code;

  if (errStatus === 429 || errMsg.includes("429") || errStr.includes("RESOURCE_EXHAUSTED")) {
    return "429 rate limit exceeded";
  }
  if (errStatus === 404 || errMsg.includes("404") || errMsg.includes("not found")) {
    return `model not found or unavailable (${process.env.GEMINI_MODEL || "gemini-2.5-flash"})`;
  }
  if (
    errMsg.includes("timeout") ||
    errMsg.includes("ETIMEDOUT") ||
    errMsg.includes("timed out") ||
    errStr.includes("Timeout")
  ) {
    return "request timeout";
  }
  if (
    errMsg.includes("ECONNRESET") ||
    errMsg.includes("ENOTFOUND") ||
    errMsg.includes("fetch failed") ||
    errMsg.includes("network")
  ) {
    return "network error";
  }

  return `error (${errMsg || errStr})`;
}

export async function generateStructuredResponse<T>(
  moduleName: string,
  systemInstruction: string,
  promptText: string,
  zodSchema: z.ZodSchema<T>,
  jsonSchema: any,
  fallbackFn: () => T,
  mockFn?: () => T,
  temperature: number = 0
): Promise<{ data: T; source: AISource; confidence?: string }> {
  const isMock = aiMockEnabled && !!mockFn;

  if (isMock) {
    console.log(
      `[AI_TELEMETRY] module=${moduleName} | mode=mock | result=mock | source=mock`
    );
    return { data: mockFn!(), source: "mock", confidence: "high" };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;

  if (!apiKey || !model) {
    const reason = !apiKey ? "missing GEMINI_API_KEY" : "missing GEMINI_MODEL";
    console.log(
      `[AI_TELEMETRY] module=${moduleName} | mode=live | result=fallback | source=fallback | reason=${reason}`
    );
    return { data: fallbackFn(), source: "fallback", confidence: "low" };
  }

  const genAI = new GoogleGenAI({ apiKey });

  const tryCall = async (): Promise<T> => {
    let timer: NodeJS.Timeout;
    const timeoutSeconds = parseInt(process.env.GEMINI_TIMEOUT_SECONDS || "10", 10);
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`request timed out (${timeoutSeconds}s limit)`)), timeoutSeconds * 1000);
    });

    const callPromise = (async () => {
      const response = await genAI.models.generateContent({
        model: model,
        contents: promptText,
        config: {
          systemInstruction: systemInstruction,
          temperature: temperature,
          responseMimeType: "application/json",
          responseSchema: jsonSchema,
          thinkingConfig: {
            thinkingLevel: (process.env.GEMINI_THINKING_LEVEL as any) || ThinkingLevel.MINIMAL
          }
        },
      });

      if (!response.text) throw new Error("No response text returned by model");
      const parsed = JSON.parse(response.text);
      return zodSchema.parse(parsed);
    })();

    try {
      return await Promise.race([callPromise, timeoutPromise]);
    } finally {
      clearTimeout(timer!);
    }
  };

  try {
    const result = await tryCall();
    console.log(
      `[AI_TELEMETRY] module=${moduleName} | mode=live | result=success | source=gemini`
    );
    return {
      data: result,
      source: "gemini",
      confidence: (result as any).confidence || "high",
    };
  } catch (error) {
    try {
      const result = await tryCall();
      console.log(
        `[AI_TELEMETRY] module=${moduleName} | mode=live | result=success_on_retry | source=gemini`
      );
      return {
        data: result,
        source: "gemini",
        confidence: (result as any).confidence || "high",
      };
    } catch (retryError) {
      const reason = getFallbackReason(retryError || error);
      console.log(
        `[AI_TELEMETRY] module=${moduleName} | mode=live | result=fallback | source=fallback | reason=${reason}`
      );
      return { data: fallbackFn(), source: "fallback", confidence: "low" };
    }
  }
}

