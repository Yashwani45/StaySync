const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'staysync_jwt_secret_key_12345');

      // Add user info from payload to request object
      req.user = {
        id: decoded.id,
        role: decoded.role
      };

      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Role authorization middleware supporting both high-level and granular provider/owner roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const userRole = req.user.role;

    // Admin and Super Admin always have full operational access
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      return next();
    }

    // Direct match
    if (roles.includes(userRole)) {
      return next();
    }

    // Role mapping for property owners
    const propertyOwnerRoles = ['PROPERTY_OWNER', 'HOSTEL_OWNER', 'PG_OWNER', 'ROOM_OWNER'];
    if (roles.includes('PROPERTY_OWNER') && propertyOwnerRoles.includes(userRole)) {
      return next();
    }
    if (userRole === 'PROPERTY_OWNER' && roles.some(r => propertyOwnerRoles.includes(r))) {
      return next();
    }

    // Role mapping for service providers
    const serviceProviderRoles = ['PROVIDER', 'TIFFIN_PROVIDER', 'CLEANING_LAUNDRY_PROVIDER'];
    if (roles.includes('PROVIDER') && serviceProviderRoles.includes(userRole)) {
      return next();
    }
    if (userRole === 'PROVIDER' && roles.some(r => serviceProviderRoles.includes(r))) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `User role '${userRole}' is not authorized to access this resource`
    });
  };
};

module.exports = { protect, authorize };
