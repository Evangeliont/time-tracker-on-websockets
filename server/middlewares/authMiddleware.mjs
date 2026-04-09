import { findUserBySessionId } from "../helpers/sessionMethods.mjs";

export const requireAuth = () => async (req, res, next) => {
  const cookies = req.headers.cookie;
  req.cookies = {};

  if (cookies) {
    const cookieArray = cookies.split("; ");
    cookieArray.forEach((cookie) => {
      const [key, value] = cookie.split("=");
      req.cookies[key] = decodeURIComponent(value);
    });
  }

  const sessionId =
    req.headers.sessionid || req.query.sessionId || (req.cookies && req.cookies.sessionId);
  if (!sessionId) {
    return res.status(403).json({ error: "Forbidden: No session ID provided" });
  }

  try {
    const user = await findUserBySessionId(req.db, sessionId);
    if (!user) {
      return res.status(403).json({ error: "Forbidden: Invalid session ID" });
    }
    req.user = user;
    req.sessionId = sessionId;
    next();
  } catch (error) {
    console.error("Error in requireAuth middleware:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
