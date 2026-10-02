import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env");

if (!fs.existsSync(envPath)) {
  console.error("Error: .env file not found at", envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const match = envContent.match(/^GEMINI_API_KEY=["']?([^"'\r\n]+)["']?/m);
const apiKey = match ? match[1].trim() : null;

if (!apiKey) {
  console.error("Error: GEMINI_API_KEY not found in .env");
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey });

async function listModels() {
  try {
    const response = await genAI.models.list();
    console.log("=== Available Gemini Models (supports generateContent) ===");
    
    // In @google/genai SDK, models.list() returns an async iterable or an object with an array/page
    const modelsList = response?.models || (Array.isArray(response) ? response : []);

    let count = 0;
    if (typeof response[Symbol.asyncIterator] === "function") {
      for await (const m of response) {
        const supportedMethods = m.supportedGenerationMethods || m.supportedActions || [];
        const supportsGenerate =
          supportedMethods.length === 0 ||
          supportedMethods.includes("generateContent") ||
          supportedMethods.includes("generate_content");
        if (supportsGenerate) {
          console.log(`- ${m.name || m.id}`);
          count++;
        }
      }
    } else {
      for (const m of modelsList) {
        const supportedMethods = m.supportedGenerationMethods || m.supportedActions || [];
        const supportsGenerate =
          supportedMethods.length === 0 ||
          supportedMethods.includes("generateContent") ||
          supportedMethods.includes("generate_content");
        if (supportsGenerate) {
          console.log(`- ${m.name || m.id}`);
          count++;
        }
      }
    }

    if (count === 0 && modelsList.length === 0) {
      console.log("Response structure:", JSON.stringify(response, null, 2));
    }
  } catch (err) {
    console.error("Error fetching models:", err.message || err);
  }
}

listModels();
