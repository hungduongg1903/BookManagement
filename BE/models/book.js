const mongoose = require("mongoose");

// Check if the model already exists before defining it
const Book =
  mongoose.models.Book ||
  mongoose.model(
    "Book",
    new mongoose.Schema(
      {
        title: { type: String, required: true },
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Author",
          required: true,
        },
        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
          required: true,
        },
        description: { type: String },
        stock: { type: Number, default: 0 },
        available: { type: Boolean, default: true },
        isbn: { type: String, required: true, unique: true }, // ISBN phải là duy nhất
        publicationYear: { type: Number, required: true }, // Năm xuất bản
        publisher: { type: String, required: true }, // Nhà xuất bản
        pages: { type: Number, required: true }, // Số trang
        image: { type: String }, // URL hình ảnh bìa sách
      },
      { timestamps: true }
    )
  );

module.exports = Book;