const jwt = require("jsonwebtoken");
const { Users, Roles, UserRoles } = require("../../../common/db/models");

const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Users.findByPk(decoded.userId, {
      include: [{ model: Roles, through: UserRoles }]
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      roleNames: user.Roles.map((r) => r.roleName)
    };

    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

const authorizeRoles = (requiredRoles) => {
  return (req, res, next) => {
    const userRoles = req.user?.roleNames || [];
    const hasAccess = userRoles.some((role) => requiredRoles.includes(role));

    if (!hasAccess) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    next();
  };
};

module.exports = {
  authenticateJWT,
  authorizeRoles
};
