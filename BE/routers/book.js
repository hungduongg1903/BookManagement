const express = require("express");
const { getAllBooks, getBookById, createBook, updateBook, deleteBook } = require("../controllers/bookController.js");

const bookRouter = express.Router();

bookRouter.get("/", getAllBooks);
bookRouter.get("/:id", getBookById);
bookRouter.post("/create", createBook);
bookRouter.put("/update/:id", updateBook);
bookRouter.delete("/delete/:id", deleteBook);

module.exports = bookRouter;
