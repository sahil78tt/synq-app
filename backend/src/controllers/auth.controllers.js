import cloudinary from "../configs/cloudinary.js";
import { generateToken } from "../configs/utils.js";
import User from "../models/users.models.js";
import bcrypt from "bcryptjs";
import { emitProfileUpdate } from "../configs/socket.js";

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
      provider: "email",
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

    // Check if user is a Google user trying to login with password
    if (user.provider === "google") {
      return res.status(400).json({
        message: "This account uses Google login. Please sign in with Google.",
      });
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

export const googleAuth = async (req, res) => {
  const { email, name, picture, googleId } = req.body;

  try {
    if (!email || !googleId) {
      return res.status(400).json({ message: "Invalid Google credentials" });
    }

    // Find existing user
    let user = await User.findOne({ email });

    if (user) {
      // User exists - update Google info if needed
      if (!user.googleId) {
        user.googleId = googleId;
        user.provider = "google";
        if (!user.profilePic && picture) {
          user.profilePic = picture;
        }
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        email,
        fullName: name,
        profilePic: picture || "",
        provider: "google",
        googleId,
      });
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
    console.log("Google Auth Error:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
};

export const logout = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, profilePic } = req.body;
    const userId = req.user._id;

    const updateData = {};

    if (fullName && fullName.trim()) {
      updateData.fullName = fullName.trim();
    }

    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = upload.secure_url;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No data to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    emitProfileUpdate(updatedUser);

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Update Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
