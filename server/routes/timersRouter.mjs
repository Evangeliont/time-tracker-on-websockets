import express from "express";
import { getTimers, createTimer, stopTimer } from "../controllers/timerController.mjs";
import { requireAuth } from "../middlewares/authMiddleware.mjs";

export const timerRouter = express.Router();

timerRouter.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.originalUrl}`);
  console.log(`Request headers: ${JSON.stringify(req.headers)}`);
  console.log(`Request body: ${JSON.stringify(req.body)}`);
  next();
});

timerRouter.get("/", requireAuth(), getTimers);
timerRouter.post("/", requireAuth(), createTimer);
timerRouter.post("/:id/stop", requireAuth(), stopTimer);
