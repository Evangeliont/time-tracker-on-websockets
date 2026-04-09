import express from "express";
import { signup, login, logout } from "../controllers/userController.mjs";
import { requireAuth } from "../middlewares/authMiddleware.mjs";

export const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.get("/logout", requireAuth(), logout);
