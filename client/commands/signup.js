import inquirer from "inquirer";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { saveSessionId } from "../helpers/session.js"; // Импортируем функции

dotenv.config();

const serverUri = process.env.SERVER;

const signup = async () => {
  try {
    const { username, password } = await inquirer.prompt([
      { type: "input", name: "username", message: "Username:" },
      { type: "password", name: "password", message: "Password:" },
    ]);

    const response = await fetch(`${serverUri}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();
    if (response.ok) {
      await saveSessionId(result.sessionId); // Сохраняем Session ID
      console.log("Signup successful. Session ID saved.");
    } else {
      console.error("Signup failed:", result.message);
    }
  } catch (error) {
    console.error("An error occurred during signup:", error.message);
  }
};

export default signup;
