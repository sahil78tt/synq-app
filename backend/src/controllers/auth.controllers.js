import cloudinary from "../configs/cloudinary.js";
import { generateToken } from "../configs/utils.js";
import User from "../models/users.models.js";
import bcrypt from "bcryptjs";

export const checkAuth = async (req, res) => {
  res.status(200).json(req.user);
};

export const signup = async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedpass = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedpass,
      fullName,
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      },
      token,
    });
  } catch (error) {
    console.log("Signup Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      },
      token,
    });
  } catch (error) {
    console.log("Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    const upload = await cloudinary.uploader.upload(profilePic);

    const updated = await User.findByIdAndUpdate(
      userId,
      { profilePic: upload.secure_url },
      { new: true },
    ).select("-password");

    res.status(200).json(updated);
  } catch (error) {
    console.log("Update Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
