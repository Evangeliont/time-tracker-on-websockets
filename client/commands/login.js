import inquirer from "inquirer";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { saveSessionId } from "../helpers/session.js";

dotenv.config();

const serverUri = process.env.SERVER;

/** @returns {Promise<string|null>} sessionId on success */
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
    if (response.ok && !result.error) {
      await saveSessionId(result.sessionId);
      console.log("Login successful. Session ID saved.");
      return result.sessionId;
    }
    console.error("Login failed:", result.error || result);
    return null;
  } catch (error) {
    console.error("An error occurred during login:", error.message);
    return null;
  }
};

export default login;
