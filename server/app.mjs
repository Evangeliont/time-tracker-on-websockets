import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import nunjucks from "nunjucks";
import { userRouter } from "./routes/usersRouter.mjs";
import { timerRouter } from "./routes/timersRouter.mjs";
import { connectMiddleware } from "./middlewares/connectMiddleware.mjs";
import { connectDB } from "./helpers/connectMongoDB.mjs";
import { findUserBySessionId } from "./helpers/sessionMethods.mjs";
import { attachWebSocketServer } from "./wsTimers.mjs";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const viewsPath = path.join(__dirname, "views");

const app = express();

nunjucks.configure(viewsPath, {
  autoescape: true,
  express: app,
  tags: {
    blockStart: "[%",
    blockEnd: "%]",
    variableStart: "[[",
    variableEnd: "]]",
    commentStart: "[#",
    commentEnd: "#]",
  },
});
app.set("views", viewsPath);
app.set("view engine", "njk");

app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));
app.use(morgan("dev"));
app.use(connectMiddleware);

app.get("/", async (req, res, next) => {
  try {
    const sessionId = req.cookies && req.cookies.sessionId;
    let user = null;
    let userToken = "";
    if (sessionId) {
      user = await findUserBySessionId(req.db, sessionId);
      if (user) {
        userToken = sessionId;
      }
    }
    res.render("index", {
      user: user ? { _id: user._id.toString() } : null,
      userToken,
    });
  } catch (err) {
    next(err);
  }
});

app.use(userRouter);
app.use("/api/timers", timerRouter);

const port = process.env.PORT || 3000;

async function bootstrap() {
  await connectDB();
  const server = http.createServer(app);
  attachWebSocketServer(server);
  server.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
