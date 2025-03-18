const express = require("express");
const router = express.Router();
const loanController = require("../controllers/loanController");
const {
  authenticate,
  authorizeAdmin,
} = require("../middlewares/authMiddleware");

// Create a new loan - requires authentication
router.post("/create", authenticate, loanController.createLoan);

// Get all loans - admin only
router.get("/", authenticate, authorizeAdmin, loanController.getAllLoans);

// Get overdue loans - admin only (place this before /:id to avoid conflicts)
router.get(
  "/overdue",
  authenticate,
  authorizeAdmin,
  loanController.getOverdueLoans
);

// Get loan by ID - authenticated users can only see their own loans
router.get("/:id", authenticate, loanController.getLoanById);

// Update loan status - admin only
router.put(
  "/update/:id",
  authenticate,
  authorizeAdmin,
  loanController.updateLoanStatus
);



// Extend loan duration
router.put("/:id/extend", authenticate, loanController.extendLoan);

module.exports = router;
