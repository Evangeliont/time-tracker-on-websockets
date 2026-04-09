import fetch from "node-fetch";
import inquirer from "inquirer";
import dotenv from "dotenv";
import { getSessionId } from "../helpers/session.js"; // Импортируем функцию

dotenv.config();

const serverUri = process.env.SERVER;

if (!serverUri) {
  console.error("SERVER environment variable is not set.");
  process.exit(1);
}

const start = async () => {
  try {
    // Проверка сессии
    const sessionId = await getSessionId();
    if (!sessionId) {
      console.error("No valid session found. Please log in first.");
      return;
    }

    console.log(`Using session ID: ${sessionId}`); // Логирование sessionId

    // Получение описания таймера от пользователя
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "description",
        message: "Timer description:",
      },
    ]);

    let response, result;

    try {
      // Отправка запроса на сервер для создания таймера
      response = await fetch(`${serverUri}/api/timers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          sessionId: sessionId, // Используем сессионный идентификатор для аутентификации
        },
        body: JSON.stringify({ description: answers.description }),
      });

      // Парсинг ответа от сервера
      result = await response.json();
    } catch (fetchError) {
      console.error("Network or server error:", fetchError.message);
      return;
    }

    // Обработка ответа от сервера
    if (response.ok) {
      console.log(`Timer started successfully. Timer ID: ${result.id}`);
    } else {
      console.error(`Failed to start timer (status: ${response.status}):`, result.error);
    }
  } catch (error) {
    console.error("Error during starting timer:", error.message);
  }
};

export default start;
