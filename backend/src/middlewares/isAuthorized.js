import jwt from "jsonwebtoken";
import User from "../models/users.models.js";

export const isAuthorized = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const isVerified = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(isVerified.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};
