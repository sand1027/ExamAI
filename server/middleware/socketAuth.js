const jwt = require("jsonwebtoken");

const socketAuth = (roles = []) => {
  return async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (roles.length && !roles.includes(decoded.user_type)) {
        return next(new Error("Authentication error: Unauthorized role"));
      }

      socket.user = decoded; // Attach decoded user to socket
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  };
};

module.exports = socketAuth;
