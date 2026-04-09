import crypto from "crypto";

export const hash = (data) => {
  return crypto.createHash("sha256").update(data).digest("hex");
};
