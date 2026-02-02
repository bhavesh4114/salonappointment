import jwt from 'jsonwebtoken';
import prisma from '../prisma/client.js';


export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          fullName: true,
          email: true,
          mobileNumber: true,
          role: true,
          isVerified: true,
          avatar: true
        }
      });
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};

/**
 * Barber authentication middleware
 * Verifies JWT token and attaches barber to req.barber
 * Separate from user authentication - queries Barber table
 */
export const barberAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "BARBER") {
      return res.status(403).json({ message: "Access denied: Not a barber" });
    }

    // ✅ ONLY barberId — NO fallback
    const barberId = Number(decoded.barberId);

    if (!barberId) {
      return res.status(401).json({ message: "Invalid barber token" });
    }

    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
    });

    if (!barber) {
      return res.status(404).json({ message: "Barber not found" });
    }

    req.barber = barber;
    next();
  } catch (error) {
    console.error("barberAuth error:", error);
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};
