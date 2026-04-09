import fs from "fs/promises";
import path from "path";
import os from "os";
import { mkdirp } from "mkdirp"; // Импортируем mkdirp

const sessionFileName = path.join(
  process.cwd(),
  "sessions",
  `${os.type().match(/windows/i) ? "_" : "."}sb-timers-session`
);

export const getSessionId = async () => {
  try {
    const sessionFileContent = await fs.readFile(sessionFileName, "utf-8");
    const sessionIdMatch = sessionFileContent.match(/Session ID: (\S+)/);
    return sessionIdMatch ? sessionIdMatch[1] : null;
  } catch (error) {
    console.error("Error reading session file:", error.message);
    return null;
  }
};

export const saveSessionId = async (sessionId) => {
  try {
    const sessionsDir = path.dirname(sessionFileName);
    await mkdirp(sessionsDir); // Создаем директорию, если не существует
    await fs.writeFile(sessionFileName, `Session ID: ${sessionId}`);
  } catch (error) {
    console.error("Error saving session file:", error.message);
  }
};

export const clearSessionId = async () => {
  try {
    await fs.unlink(sessionFileName);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Error removing session file:", error.message);
    }
  }
};
