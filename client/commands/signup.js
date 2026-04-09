import inquirer from "inquirer";
import fetch from "node-fetch";
import dotenv from "dotenv";

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
      console.log("Signup successful:", result);
    } else {
      console.error("Signup failed:", result);
    }
  } catch (error) {
    console.error("An error occurred during signup:", error.message);
  }
};

export default signup;
