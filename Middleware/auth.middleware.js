const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware function for authentication
const Auth = (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) {
    return res.status(401).send({ msg: "Access Denied. No token provided." });
  }

  // Verify the token
  jwt.verify(token, process.env.key, (err, decoded) => {
    if (err) {
      return res.status(401).send({ msg: "Invalid token." });
    } else {
      // Add the decoded user ID to the request body
      req.body.userId = decoded.id;
      next();
    }
  });
};

module.exports = {
  Auth,
};
