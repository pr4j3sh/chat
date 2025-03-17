const jwt = require("jsonwebtoken");

async function generateToken(payload) {
  const token = await jwt.sign({ userId: payload }, process.env.SECRET);
  return token;
}

module.exports = { generateToken };
