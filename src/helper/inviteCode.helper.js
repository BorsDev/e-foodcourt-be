const generateCode = async () => {
  const code = require("crypto").randomBytes(32).toString("hex");
  const expiry = Date.now() + 30 * 60 * 1000;
  const expiredAt = new Date(expiry);
  return { code, expiredAt };
};
module.exports = { generateCode };
