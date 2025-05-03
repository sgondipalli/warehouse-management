const jwt = require("jsonwebtoken");
const { Users, Roles, UserRoles } = require("../../../common/db/models");

const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("❗ Authorization header missing or malformed:", authHeader);
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Incoming Token:", token);
    console.log("✅ Decoded Payload:", decoded);

    if (!decoded.userId) {
      console.error("❗ Decoded token missing userId.");
      return res.status(401).json({ message: "Unauthorized: Invalid token payload" });
    }

    const user = await Users.findByPk(decoded.userId, {
      include: [{ model: Roles, through: UserRoles }]
    });

    if (!user) {
      console.error("❗ User not found in database for ID:", decoded.userId);
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = {
      userId: user.id,
      roleNames: user.Roles.map(r => r.roleName),
      email: user.email,
    };

    next();
  } catch (error) {
    console.error("❗ JWT verification failed:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

// Role check middleware stays same
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roleNames.some(role => allowedRoles.includes(role))) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
    next();
  };
};

module.exports = { authenticateJWT, authorizeRoles };
