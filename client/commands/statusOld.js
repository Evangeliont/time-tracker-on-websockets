import fetch from "node-fetch";
import dotenv from "dotenv";
import Table from "cli-table";
import { formatTime } from "../helpers/format.js"; // Обновленный импорт
import { getSessionId } from "../helpers/session.js"; // Импортируем функцию

dotenv.config();

const serverUri = process.env.SERVER;

const statusOld = async () => {
  try {
    const sessionId = await getSessionId(); // Читаем Session ID

    const response = await fetch(`${serverUri}/api/timers?isActive=false`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        SessionID: sessionId, // Добавляем Session ID в заголовок
      },
    });
    const result = await response.json();

    if (response.ok) {
      if (Array.isArray(result) && result.length > 0) {
        const table = new Table({
          head: ["ID", "Description", "Duration"],
          colWidths: [40, 30, 20],
        });

        result.forEach((timer) => {
          table.push([timer.id, timer.description, formatTime(timer.duration)]);
        });

        console.log(table.toString());
      } else {
        console.error("No timers found.");
      }
    } else {
      console.error("Failed to fetch old timers:", result.message);
    }
  } catch (error) {
    console.error("Error during fetching old timers:", error.message);
  }
};

export default statusOld;
