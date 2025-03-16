const express = require("express");

const bookRouter = require("./book.js");
const authorRouter = require("./author.js");
const categoryRouter = require("./category.js");
// const userRouter = require("./user.js");
// const loanRouter = require("./loan.js");

const router = express.Router();

router.use("/books", bookRouter);
router.use("/authors", authorRouter);
router.use("/categories", categoryRouter);
// router.use("/users", userRouter);
// router.use("/loans", loanRouter);
const loanRoutes = require("./loan"); // Add this line
router.use("/loans", loanRoutes); // Add this line
// Mount other routers if they exist
// router.use("/authors", authorRouter);
// router.use("/categories", categoryRouter);
// router.use("/users", userRouter);

// User loans route can be added to userRouter or handled here
// router.get("/users/:id/loans", authenticate, loanController.getUserLoans);
module.exports = router;
