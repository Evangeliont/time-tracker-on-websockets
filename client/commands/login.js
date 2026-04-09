import inquirer from "inquirer";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { saveSessionId } from "../helpers/session.js"; // Импортируем функции

dotenv.config();

const serverUri = process.env.SERVER;

const login = async () => {
  try {
    const { username, password } = await inquirer.prompt([
      { type: "input", name: "username", message: "Username:" },
      { type: "password", name: "password", message: "Password:" },
    ]);

    const response = await fetch(`${serverUri}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();
    if (response.ok) {
      await saveSessionId(result.sessionId); // Сохраняем Session ID
      console.log("Login successful. Session ID saved.");
    } else {
      console.error("Login failed:", result.message);
    }
  } catch (error) {
    console.error("An error occurred during login:", error.message);
  }
};

export default login;
