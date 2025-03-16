const Author = require("../models/author");

// Lấy danh sách tất cả tác giả
exports.getAllAuthors = async (req, res) => {
  try {
    const authors = await Author.find();
    res.status(200).json(authors);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách tác giả", error: error.message });
  }
};

// Lấy thông tin chi tiết của một tác giả theo ID
exports.getAuthorById = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).json({ message: "Không tìm thấy tác giả" });
    res.status(200).json(author);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin tác giả", error: error.message });
  }
};

// Thêm một tác giả mới
exports.createAuthor = async (req, res) => {
  try {
    const { name, birthYear, nationality } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!name || !birthYear || !nationality) {
      return res.status(400).json({ message: "Tên, năm sinh và quốc tịch là bắt buộc" });
    }

    const newAuthor = new Author({
      name,
      birthYear,
      nationality,
    });

    const savedAuthor = await newAuthor.save();
    res.status(201).json(savedAuthor);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo tác giả", error: error.message });
  }
};

// Cập nhật thông tin một tác giả theo ID
exports.updateAuthor = async (req, res) => {
  try {
    const { name, birthYear, nationality } = req.body;

    const updatedAuthor = await Author.findByIdAndUpdate(
      req.params.id,
      {
        name,
        birthYear,
        nationality,
      },
      { new: true }
    );

    if (!updatedAuthor) return res.status(404).json({ message: "Không tìm thấy tác giả" });

    res.status(200).json(updatedAuthor);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật tác giả", error: error.message });
  }
};

// Xóa một tác giả theo ID
exports.deleteAuthor = async (req, res) => {
  try {
    const deletedAuthor = await Author.findByIdAndDelete(req.params.id);
    if (!deletedAuthor) return res.status(404).json({ message: "Không tìm thấy tác giả" });

    res.status(200).json({ message: `Tác giả "${deletedAuthor.name}" đã bị xóa thành công` });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa tác giả", error: error.message });
  }
};