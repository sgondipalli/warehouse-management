// utils/roleValidator.js

const isRoleRestrictedByManager = (creatorRole, targetRole) => {
    if (creatorRole === "Warehouse Manager") {
      return ["Super Admin", "Auditor/Compliance Officer"].includes(targetRole);
    }
    return false;
  };
  
  const canAssignLocations = (role) => {
    return role !== "Super Admin"; // Super Admins don't need location binding
  };
  
  module.exports = { isRoleRestrictedByManager, canAssignLocations };
  