const Book = require("../models/book");
const Author = require("../models/author");
const Category = require("../models/category");

// Lấy danh sách tất cả sách
exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.find().populate("author category");
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách sách", error });
    }
};

// Lấy thông tin chi tiết của một sách theo ID
exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate("author category");
        if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy thông tin sách", error });
    }
};

// Thêm một sách mới
exports.createBook = async (req, res) => {
    try {
        const { title, author, category, description, stock } = req.body;

        if (!title || !author || !category) {
            return res.status(400).json({ message: "Tiêu đề, tác giả và thể loại là bắt buộc" });
        }

        const newBook = new Book({
            title,
            author,
            category,
            description,
            stock: stock || 0,
            available: stock > 0
        });

        const savedBook = await newBook.save();
        res.status(201).json(savedBook);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi tạo sách", error });
    }
};

// Cập nhật thông tin một sách theo ID
exports.updateBook = async (req, res) => {
    try {
        const { title, author, category, description, stock } = req.body;

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            {
                title,
                author,
                category,
                description,
                stock,
                available: stock > 0
            },
            { new: true }
        ).populate("author category");

        if (!updatedBook) return res.status(404).json({ message: "Không tìm thấy sách" });

        res.status(200).json(updatedBook);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật sách", error });
    }
};

// Xóa một sách theo ID
exports.deleteBook = async (req, res) => {
    try {
        const deletedBook = await Book.findByIdAndDelete(req.params.id);
        if (!deletedBook) return res.status(404).json({ message: "Không tìm thấy sách" });

        res.status(200).json({ message: "Sách đã bị xóa" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa sách", error });
    }
};
