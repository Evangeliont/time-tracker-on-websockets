import fetch from "node-fetch";
import dotenv from "dotenv";
import Table from "cli-table";
import { formatDuration } from "../helpers/format.js"; // Обновленный импорт
import { getSessionId } from "../helpers/session.js"; // Импортируем функцию

dotenv.config();

const serverUri = process.env.SERVER;

const statusAll = async () => {
  try {
    const sessionId = await getSessionId(); // Читаем Session ID

    const response = await fetch(`${serverUri}/api/timers?isActive=true`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        SessionID: sessionId, // Добавляем Session ID в заголовок
      },
    });
    const data = await response.json();

    if (response.ok) {
      if (Array.isArray(data) && data.length > 0) {
        const table = new Table({
          head: ["ID", "Description", "Progress"],
          colWidths: [40, 30, 20],
        });

        data.forEach((timer) => {
          table.push([timer.id, timer.description, formatDuration(timer.progress)]);
        });

        console.log(table.toString());
      } else {
        console.error("No timers found.");
      }
    } else {
      console.error("Failed to fetch status:", data.message);
    }
  } catch (error) {
    console.error("Error during fetching status:", error.message);
  }
};

export default statusAll;
