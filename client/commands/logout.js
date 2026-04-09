import fs from "fs";
import path from "path";
import os from "os";

const sessionFileName = path.join(
  process.cwd(),
  "sessions",
  `${os.type().match(/windows/i) ? "_" : "."}sb-timers-session`
);

const logout = () => {
  if (fs.existsSync(sessionFileName)) {
    fs.unlinkSync(sessionFileName);
    console.log("Logout successful. Session file deleted.");
  } else {
    console.log("No active session found.");
  }
};

export default logout;
