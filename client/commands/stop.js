import fetch from "node-fetch";
import inquirer from "inquirer";
import dotenv from "dotenv";
import { getSessionId } from "../helpers/session.js";

dotenv.config();

const serverUri = process.env.SERVER;

const stop = async (timerIdArg) => {
  try {
    const sessionId = await getSessionId();
    if (!sessionId) {
      console.error("No valid session found. Please log in first.");
      return;
    }

    let timerId = timerIdArg;
    if (!timerId) {
      const answer = await inquirer.prompt([{ type: "input", name: "id", message: "Timer ID:" }]);
      timerId = answer.id;
    }

    const response = await fetch(`${serverUri}/api/timers/${timerId}/stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        SessionID: sessionId,
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
