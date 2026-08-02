const jwt = require("jsonwebtoken");

const generateToken = (payload, expiresIn = "2h") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

module.exports = generateToken;
