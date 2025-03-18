const express = require("express");
const { getAllBooks, getBookById, createBook, updateBook, deleteBook } = require("../controllers/bookController.js");
const {
    authenticate,
    authorizeAdmin,
  } = require("../middlewares/authMiddleware");

const bookRouter = express.Router();

bookRouter.get("/", getAllBooks);
bookRouter.get("/:id", getBookById);
bookRouter.post("/create", authenticate, authorizeAdmin, createBook);
bookRouter.put("/update/:id", authenticate, authorizeAdmin, updateBook);
bookRouter.delete("/delete/:id", authenticate, authorizeAdmin, deleteBook);

module.exports = bookRouter;
