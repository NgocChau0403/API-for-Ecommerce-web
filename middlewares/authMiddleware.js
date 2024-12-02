const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// Middleware xác thực người dùng
const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        // Giải mã token và lấy thông tin người dùng
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id);
        if (!user) {
          throw new Error("User not found");
        }

        // Gán thông tin người dùng vào req.user
        req.user = {
          _id: decoded.id,
          email: user.email,
          role: user.role, // Gán cả role nếu cần
        };
        next();
      } else {
        throw new Error("No token attached to header");
      }
    } catch (error) {
      throw new Error("Not Authorized or Token expired, Please Login again");
    }
  } else {
    throw new Error("No token attached to header");
  }
});

// Middleware kiểm tra quyền Admin
const isAdmin = asyncHandler(async (req, res, next) => {
  const { role } = req.user;
  if (role !== "admin") {
    throw new Error("You are not an admin");
  } else {
    next();
  }
});

module.exports = { authMiddleware, isAdmin };
