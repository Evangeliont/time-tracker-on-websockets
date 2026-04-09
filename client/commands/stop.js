import fetch from "node-fetch";
import dotenv from "dotenv";
import { getSessionId } from "../helpers/session.js"; // Импортируем функцию

dotenv.config();

const serverUri = process.env.SERVER;

const stop = async (timerId) => {
  try {
    const sessionId = await getSessionId(); // Читаем Session ID

    const response = await fetch(`${serverUri}/api/timers/${timerId}/stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        SessionID: sessionId, // Добавляем Session ID в заголовок
      },
    });

    if (response.ok) {
      console.log(`Timer with ID ${timerId} stopped successfully.`);
    } else {
      const errorText = await response.text();
      console.error("Failed to stop timer:", errorText);
    }
  } catch (error) {
    console.error("Error during stopping timer:", error.message);
  }
};

export default stop;
