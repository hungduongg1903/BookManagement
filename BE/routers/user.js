const express = require("express");
const router = express.Router();
const {
  authenticate,
  authorizeAdmin,
} = require("../middlewares/authMiddleware");
const loanController = require("../controllers/loanController");

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

// Add other user routes here

module.exports = router;
