/**
 * Role-Based Access Control Middleware
 * @param {Array<string>} allowedRoles
 */
const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Forbidden. Requires one of the following roles: [${allowedRoles.join(', ')}].`,
      });
    }

    next();
  };
};

module.exports = {
  requireRole,
};
