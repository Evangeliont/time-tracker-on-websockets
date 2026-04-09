import express from "express";
import { getTimers, createTimer, stopTimer } from "../controllers/timerController.mjs";
import { requireAuth } from "../middlewares/authMiddleware.mjs";

export const timerRouter = express.Router();

timerRouter.get("/", requireAuth(), getTimers);
timerRouter.post("/", requireAuth(), createTimer);
timerRouter.post("/:id/stop", requireAuth(), stopTimer);
