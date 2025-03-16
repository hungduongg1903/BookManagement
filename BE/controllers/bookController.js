const Book = require("../models/book");
const Author = require("../models/author");
const Category = require("../models/category");

// Lấy danh sách tất cả sách
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate("author category");
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách sách", error: error.message });
  }
};

// Lấy thông tin chi tiết của một sách theo ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("author category");
    if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin sách", error: error.message });
  }
};

// Thêm một sách mới
exports.createBook = async (req, res) => {
  try {
    const { title, author, category, description, stock, isbn, publicationYear, publisher, pages, image } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!title || !author || !category || !isbn || !publicationYear || !publisher || !pages) {
      return res.status(400).json({ message: "Tiêu đề, tác giả, thể loại, ISBN, năm xuất bản, nhà xuất bản và số trang là bắt buộc" });
    }

    const newBook = new Book({
      title,
      author,
      category,
      description,
      stock: stock || 0,
      available: stock > 0,
      isbn,
      publicationYear,
      publisher,
      pages,
      image,
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo sách", error: error.message });
  }
};

// Cập nhật thông tin một sách theo ID
exports.updateBook = async (req, res) => {
  try {
    const { title, author, category, description, stock, isbn, publicationYear, publisher, pages, image } = req.body;

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title,
        author,
        category,
        description,
        stock,
        available: stock > 0,
        isbn,
        publicationYear,
        publisher,
        pages,
        image,
      },
      { new: true }
    ).populate("author category");

    if (!updatedBook) return res.status(404).json({ message: "Không tìm thấy sách" });

    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật sách", error: error.message });
  }
};

// Xóa một sách theo ID
exports.deleteBook = async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ message: "Không tìm thấy sách" });

    res.status(200).json({ message: `Sách "${deletedBook.title}" đã bị xóa thành công` });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa sách", error: error.message });
  }
};