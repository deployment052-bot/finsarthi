import jwt from "jsonwebtoken";
import User from "../module/User/models.js";
import Admin from "../module/auth/admin/admin.model.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. get token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // 2. verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = null;

    // 3. ROLE BASED FETCH
    if (decoded.role === "ADMIN") {
      user = await Admin.findById(decoded.id).select("-password");
    } else {
      user = await User.findById(decoded.id).select("-mpin");
    }

    // 4. check user/admin exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 5. attach request user
    req.user = user;
    req.role = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};