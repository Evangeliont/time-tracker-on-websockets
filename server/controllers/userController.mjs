import { ObjectId } from "mongodb";
import { hash } from "../helpers/cryptoHelper.mjs";
import { createSession, deleteSession } from "../helpers/sessionMethods.mjs";

const signup = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!password) {
      return res.status(400).send("Password is required");
    }

    const newUser = {
      _id: new ObjectId(),
      username,
      password: hash(password),
    };
    await req.db.collection("users").insertOne(newUser);
    res.json("Successfully registred");
  } catch (error) {
    res.status(404).json({ error: "Registration error" });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await req.db.collection("users").findOne({ username });
    if (!user || user.password !== hash(password)) {
      return res.json({ error: "Something went wrong" });
    }

    const sessionId = await createSession(req.db, user._id);

    res.cookie("sessionId", sessionId, { httpOnly: true, sameSite: "lax", path: "/" });
    res.json({ sessionId });
  } catch (error) {
    res.status(403).json({ error: "Does not exist" });
  }
};

const logout = async (req, res) => {
  try {
    if (!req.user) {
      return res.send({});
    }

    await deleteSession(req.db, req.sessionId);
    res.clearCookie("sessionId", { path: "/" });
    res.json("Successfully logged out");
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export { signup, login, logout };
