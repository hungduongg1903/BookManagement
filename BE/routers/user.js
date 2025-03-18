const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const loanController = require("../controllers/loanController");
const {
  authenticate,
  authorizeAdmin,
} = require("../middlewares/authMiddleware");

// Public routes
router.post("/register", userController.register);
router.post("/login", userController.login);

// Protected routes - require authentication
router.get("/profile", authenticate, userController.getProfile);

// Get a user's loan history
router.get(
  "/:id/loans",
  authenticate,
  (req, res, next) => {
    // Only allow users to see their own loans or admins to see any user's loans
    if (
      req.user.role !== "admin" &&
      req.user._id.toString() !== req.params.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  },
  loanController.getUserLoans
);

// Admin routes
router.get("/", authenticate, authorizeAdmin, userController.getAllUsers);
router.get("/:id", authenticate, userController.getUserById);
router.put(
  "/:id",
  authenticate,
  (req, res, next) => {
    // Only allow users to update their own profile or admins to update any profile
    if (
      req.user.role !== "admin" &&
      req.user._id.toString() !== req.params.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  },
  userController.updateUser
);
router.delete("/:id", authenticate, authorizeAdmin, userController.deleteUser);

module.exports = router;
