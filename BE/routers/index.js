const express = require("express");

const bookRouter = require("./book.js");
// const authorRouter = require("./author.js");
// const categoryRouter = require("./category.js");
// const userRouter = require("./user.js");
// const loanRouter = require("./loan.js");

const router = express.Router();

router.use("/books", bookRouter);
// router.use("/authors", authorRouter);
// router.use("/categories", categoryRouter);
// router.use("/users", userRouter);
// router.use("/loans", loanRouter);

module.exports = router;
