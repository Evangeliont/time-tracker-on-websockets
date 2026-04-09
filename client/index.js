import dotenv from "dotenv";
import inquirer from "inquirer";
import fetch from "node-fetch";
import WebSocket from "ws";
import Table from "cli-table";
import { getSessionId, clearSessionId } from "./helpers/session.js";
import { formatDuration } from "./helpers/format.js";
import signup from "./commands/signup.js";
import login from "./commands/login.js";
import start from "./commands/start.js";
import stop from "./commands/stop.js";

dotenv.config();

const serverUri = process.env.SERVER;

if (!serverUri) {
  console.error("SERVER environment variable is not set.");
  process.exit(1);
}

let loggedIn = false;
let ws = null;
let activeTimers = [];
let oldTimers = [];

function disconnectWs() {
  if (ws) {
    try {
      ws.close();
    } catch {
      /* ignore */
    }
    ws = null;
  }
}

function connectWs(sessionId) {
  disconnectWs();
  const base = new URL(serverUri);
  const wsProto = base.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${wsProto}//${base.host}/ws?sessionId=${encodeURIComponent(sessionId)}`;
  const socket = new WebSocket(wsUrl);
  ws = socket;
  socket.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === "all_timers") {
        activeTimers = msg.active || [];
        oldTimers = msg.old || [];
      } else if (msg.type === "active_timers") {
        activeTimers = msg.payload || [];
      }
    } catch (e) {
      console.error("Bad WS message:", e.message);
    }
  });
  socket.on("error", (err) => {
    console.error("WebSocket error:", err.message);
  });
}

function printActiveTable() {
  if (activeTimers.length === 0) {
    console.log("No active timers.");
    return;
  }
  const table = new Table({
    head: ["ID", "Description", "Progress"],
    colWidths: [40, 30, 20],
  });
  activeTimers.forEach((t) => {
    table.push([t.id, t.description, formatDuration(t.progress || 0)]);
  });
  console.log(table.toString());
}

function printOldTable() {
  if (oldTimers.length === 0) {
    console.log("No old timers.");
    return;
  }
  const table = new Table({
    head: ["ID", "Description", "Duration"],
    colWidths: [40, 30, 20],
  });
  oldTimers.forEach((t) => {
    table.push([t.id, t.description, formatDuration(t.duration || 0)]);
  });
  console.log(table.toString());
}

async function cmdLogout() {
  const sid = await getSessionId();
  if (sid) {
    try {
      await fetch(`${serverUri}/logout`, {
        headers: { SessionID: sid },
      });
    } catch (e) {
      console.error("Logout request failed:", e.message);
    }
  }
  disconnectWs();
  await clearSessionId();
  loggedIn = false;
  activeTimers = [];
  oldTimers = [];
  console.log("Logged out.");
}

function waitForWsSync(ms = 400) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const existing = await getSessionId();
  if (existing) {
    loggedIn = true;
    connectWs(existing);
    await waitForWsSync(600);
  }

  let isRunning = true;

  while (isRunning) {
    if (cmd === "exit") {
      disconnectWs();
      isRunning = false;
      process.exit(0);
    }

    const { line } = await inquirer.prompt([
      {
        type: "input",
        name: "line",
        message: loggedIn ? "> " : "(login required) > ",
      },
    ]);

    const trimmed = (line || "").trim();
    if (!trimmed) continue;

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (cmd === "exit") {
      disconnectWs();
      process.exit(0);
    }

    const allowedWithoutLogin = new Set(["signup", "login", "exit"]);
    if (!loggedIn && !allowedWithoutLogin.has(cmd)) {
      console.log("You need to login first");
      continue;
    }

    switch (cmd) {
      case "signup":
        await signup();
        break;
      case "login": {
        const sid = await login();
        if (sid) {
          loggedIn = true;
          connectWs(sid);
          await waitForWsSync(600);
        }
        break;
      }
      case "logout":
        await cmdLogout();
        break;
      case "start":
        await start();
        await waitForWsSync(500);
        printActiveTable();
        break;
      case "stop":
        await stop(args[0]);
        await waitForWsSync(500);
        printActiveTable();
        console.log("");
        printOldTable();
        break;
      case "status": {
        let which = args[0];
        if (which !== "all" && which !== "old") {
          const ans = await inquirer.prompt([
            {
              type: "list",
              name: "which",
              message: "Which timers?",
              choices: [
                { name: "active (all)", value: "all" },
                { name: "old", value: "old" },
              ],
            },
          ]);
          which = ans.which;
        }
        if (which === "all") {
          printActiveTable();
        } else {
          printOldTable();
        }
        break;
      }
      default:
        console.log("Unknown command. Try: signup, login, logout, start, stop, status, exit");
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
