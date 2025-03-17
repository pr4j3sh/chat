const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers["authorization"];
    if (!header || !header.startsWith("Bearer")) {
      throw new Error("unauthorised");
    }

    const token = header.split(" ")[1];
    if (!token) {
      throw new Error("unauthorised");
    }

    jwt.verify(token, process.env.SECRET, (err, payload) => {
      if (err) {
        throw new Error(err.message);
      }

      req.user = payload;
      next();
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = { authenticate };
