import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
  userId?: string;
  id?: string;
  _id?: string;
  email?: string;
}

const protect = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided. Authorization denied.",
    });
  }

  const token = authHeader.split(" ")[1] ?? "";

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as DecodedToken;

    req.user = {
      userId: decoded.userId || decoded.id || decoded._id,
      email: decoded.email,
    };

    if (!req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    next();
  } catch (err: any) {
    const message =
      err?.name === "TokenExpiredError"
        ? "Token has expired. Please log in again."
        : "Invalid token. Authorization denied.";

    return res.status(401).json({
      success: false,
      message,
    });
  }
};

export { protect };
export default protect;