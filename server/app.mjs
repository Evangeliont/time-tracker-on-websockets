import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { userRouter } from "./routes/usersRouter.mjs";
import { timerRouter } from "./routes/timersRouter.mjs";
import { connectMiddleware } from "./middlewares/connectMiddleware.mjs";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use(morgan("dev"));
app.use(connectMiddleware);

app.use(userRouter);
app.use("/api/timers", timerRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
