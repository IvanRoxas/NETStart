import fs from "fs";
import path from "path";

export interface SystemSettings {
  shuffleAptitudeQuestions: boolean;
}

const DEFAULT_SETTINGS: SystemSettings = {
  shuffleAptitudeQuestions: true,
};

const SETTINGS_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "server",
  "data",
  "system_settings.server.json"
);

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const data = fs.readFileSync(SETTINGS_FILE_PATH, "utf8");
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
      };
    }
  } catch (err) {
    console.warn("[SystemSettings] Failed to read system settings, using defaults:", err);
  }
  return { ...DEFAULT_SETTINGS };
}

export async function updateSystemSettings(
  updates: Partial<SystemSettings>
): Promise<SystemSettings> {
  try {
    const current = await getSystemSettings();
    const updated: SystemSettings = {
      ...current,
      ...updates,
    };

    const dir = path.dirname(SETTINGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(updated, null, 2), "utf8");
    return updated;
  } catch (err) {
    console.error("[SystemSettings] Failed to save system settings:", err);
    throw new Error("Failed to persist system settings.");
  }
}

