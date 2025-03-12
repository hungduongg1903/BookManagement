const Category = require("../models/category");
const Book = require("../models/book");

// Tạo danh mục mới
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = new Category({ name, description });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy danh sách danh mục
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết danh mục
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin danh mục
const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    if (!category)
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa danh mục
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    res.status(200).json({ message: "Danh mục đã được xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả sách trong danh mục
const getBooksByCategory = async (req, res) => {
  try {
    const books = await Book.find({ category: req.params.id });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getBooksByCategory,
};
