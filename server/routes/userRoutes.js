import express from "express";
import {
  registerUser,
  getAllUsers,
  updateUser,
  deleteUser,
  loginUser
} from "../Controllers/userController.js";

const router = express.Router();

// POST: Add a user
router.post("/signup", registerUser);

// POST: Login the user
router.post("/login", loginUser);

// GET: All users
router.get("/", getAllUsers);

// PATCH: Update user (role or password)
router.patch("/:username", updateUser);

// DELETE: Remove a user
router.delete("/:username", deleteUser);

export default router;
