import User from "../models/UserSchema.js";
import bcrypt from "bcrypt"; // For password hashing
import generateToken from "../utilities/generateToken.js";

// Create new user
export const registerUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt=await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      password: hashedPassword,
      role
    });

    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      },
      token
    });

  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
};

//Login existing User
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      },
      token
    });

  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};

// Update user (role or password)
export const updateUser = async (req, res) => {
  try {
    const { username } = req.params;
    const { password, role } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (password) user.password = await bcrypt.hash(password, 10);
    if (role) user.role = role;

    await user.save();

    res.json({ message: "User updated", user: { username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Error updating user", error: err.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { username } = req.params;

    const deleted = await User.findOneAndDelete({ username });
    if (!deleted) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted", username: deleted.username });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
};
