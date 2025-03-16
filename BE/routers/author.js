const express = require("express");
const { getAllAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor } = require("../controllers/authorController.js");

const authorRouter = express.Router();

authorRouter.get("/", getAllAuthors);
authorRouter.get("/:id", getAuthorById);
authorRouter.post("/create", createAuthor);
authorRouter.put("/update/:id", updateAuthor);
authorRouter.delete("/delete/:id", deleteAuthor);

module.exports = authorRouter;
