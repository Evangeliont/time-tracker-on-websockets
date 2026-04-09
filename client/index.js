import { Command } from "commander";
import signup from "./commands/signup.js";
import login from "./commands/login.js";
import logout from "./commands/logout.js";
import start from "./commands/start.js";
import stop from "./commands/stop.js";
import statusAll from "./commands/statusAll.js";
import statusOld from "./commands/statusOld.js";

const program = new Command();

program.command("signup").description("Sign up a new user").action(signup);

program.command("login").description("Log in as an existing user").action(login);

program.command("logout").description("Log out the current user").action(logout);

program.command("start").description("Start a new timer").action(start);

program.command("stop <timerId>").description("Stop a running timer").action(stop);

const statusCommand = program.command("status").description("Get the status of timers");

statusCommand.command("all").description("Get the status of all active timers").action(statusAll);

statusCommand.command("old").description("Get the status of all inactive timers").action(statusOld);

program.parse(process.argv);
