const express = require("express");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getBooksByCategory,
} = require("../controllers/categoryController");

const router = express.Router();

// Định nghĩa các routes cho danh mục

router.post("/create", createCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.put("/update/:id", updateCategory);
router.delete("/delete/:id", deleteCategory);
router.get("/:id/books", getBooksByCategory);

module.exports = router;
