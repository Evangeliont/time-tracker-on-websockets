import { parse as parseUrl } from "url";
import { ObjectId } from "mongodb";
import { WebSocketServer } from "ws";
import { findUserBySessionId } from "./helpers/sessionMethods.mjs";
import { getDB } from "./helpers/connectMongoDB.mjs";

const clientsByUserId = new Map();

function userKey(userId) {
  return userId instanceof ObjectId ? userId.toString() : String(userId);
}

async function buildAllTimersPayload(db, userId) {
  const oid = userId instanceof ObjectId ? userId : new ObjectId(userId);
  const activeDocs = await db
    .collection("timers")
    .find({ userId: oid, isActive: true })
    .toArray();
  const oldDocs = await db
    .collection("timers")
    .find({ userId: oid, isActive: false })
    .toArray();

  const active = activeDocs.map((t) => ({
    id: t.id,
    description: t.description,
    isActive: true,
    start: t.start,
    progress: Date.now() - new Date(t.start).getTime(),
  }));

  const old = oldDocs.map((t) => ({
    id: t.id,
    description: t.description,
    isActive: false,
    start: t.start,
    end: t.end,
    duration: t.duration,
  }));

  return { active, old };
}

async function buildActiveTimersPayload(db, userId) {
  const oid = userId instanceof ObjectId ? userId : new ObjectId(userId);
  const activeDocs = await db
    .collection("timers")
    .find({ userId: oid, isActive: true })
    .toArray();
  return activeDocs.map((t) => ({
    id: t.id,
    description: t.description,
    isActive: true,
    start: t.start,
    progress: Date.now() - new Date(t.start).getTime(),
  }));
}

export async function notifyUserAllTimers(userId) {
  const db = getDB();
  if (!db) return;
  const key = userKey(userId);
  const sockets = clientsByUserId.get(key);
  if (!sockets || sockets.size === 0) return;

  const { active, old } = await buildAllTimersPayload(db, userId);
  const msg = JSON.stringify({ type: "all_timers", active, old });
  for (const ws of sockets) {
    if (ws.readyState === 1) {
      ws.send(msg);
    }
  }
}

export function attachWebSocketServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", async (ws, req) => {
    const parsed = parseUrl(req.url || "", true);
    const raw = parsed.query.sessionId;
    const sessionId = Array.isArray(raw) ? raw[0] : raw;
    if (!sessionId) {
      ws.close(4001, "No session");
      return;
    }

    const db = getDB();
    if (!db) {
      ws.close(1011, "DB not ready");
      return;
    }

    const user = await findUserBySessionId(db, sessionId);
    if (!user) {
      ws.close(4002, "Invalid session");
      return;
    }

    const key = userKey(user._id);
    if (!clientsByUserId.has(key)) {
      clientsByUserId.set(key, new Set());
    }
    clientsByUserId.get(key).add(ws);

    ws.on("close", () => {
      const set = clientsByUserId.get(key);
      if (set) {
        set.delete(ws);
        if (set.size === 0) {
          clientsByUserId.delete(key);
        }
      }
    });

    const { active, old } = await buildAllTimersPayload(db, user._id);
    ws.send(JSON.stringify({ type: "all_timers", active, old }));
  });

  setInterval(async () => {
    const db = getDB();
    if (!db) return;

    for (const [key, sockets] of clientsByUserId) {
      if (sockets.size === 0) continue;
      let userId;
      try {
        userId = new ObjectId(key);
      } catch {
        continue;
      }
      const payload = await buildActiveTimersPayload(db, userId);
      const msg = JSON.stringify({ type: "active_timers", payload });
      for (const ws of sockets) {
        if (ws.readyState === 1) {
          ws.send(msg);
        }
      }
    }
  }, 1000);
}
