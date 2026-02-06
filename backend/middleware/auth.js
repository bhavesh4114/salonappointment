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
 * Verifies JWT token and attaches barber to req.barber and req.user (for barber routes).
 * Single source of truth: barberId from JWT only (never from query/body).
 */
export const barberAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.get?.("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const role = String(decoded.role || "").toUpperCase();
    if (role !== "BARBER") {
      return res.status(403).json({ success: false, message: "Access denied: Not a barber" });
    }

    // Support both barberId and id in token (single source of truth = JWT)
    const rawId = decoded.barberId ?? decoded.id;
    const barberId = rawId != null ? Number(rawId) : NaN;
    if (!barberId || Number.isNaN(barberId) || barberId < 1) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[barberAuth] Missing or invalid barberId in token. decoded:", { ...decoded, barberId: decoded.barberId, id: decoded.id });
      }
      return res.status(401).json({ success: false, message: "Invalid barber token: barberId missing or invalid" });
    }

    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
    });

    if (!barber) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[barberAuth] Barber not found in database for id:", barberId);
      }
      return res.status(404).json({ success: false, message: "Barber not found" });
    }

    // Access control: allow only TRIAL or ACTIVE; block FAILED / CANCELLED
    const subStatus = (barber.subscriptionStatus || "").toUpperCase();
    if (subStatus === "FAILED" || subStatus === "CANCELLED") {
      return res.status(403).json({
        success: false,
        message: "Subscription inactive. Please update your payment to access the platform.",
        code: "SUBSCRIPTION_INACTIVE",
        subscriptionStatus: subStatus,
      });
    }

    req.barber = barber;
    req.user = { id: barber.id, barberId: barber.id, role: "BARBER" };
    if (process.env.NODE_ENV !== "production") {
      console.log("[barberAuth] barberId resolved:", barber.id, "for route:", req.method, req.path);
    }
    next();
  } catch (error) {
    console.error("barberAuth error:", error);
    return res.status(401).json({ success: false, message: "Token invalid or expired" });
  }
};
