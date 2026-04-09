import { connectDB } from "../helpers/connectMongoDB.mjs";

export const connectMiddleware = async (req, res, next) => {
  try {
    const db = await connectDB();
    req.db = db;
    next();
  } catch (error) {
    next(error);
  }
};
