module.exports = (roles) => {
    return (req, res, next) => {
      if (!req.user || !req.user.roles.some(role => roles.includes(role.roleName))) {
        return res.status(403).json({ message: "Access denied" });
      }
      next();
    };
  };
  