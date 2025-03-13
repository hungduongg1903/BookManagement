const mongoose = require("mongoose");

// Check if the model already exists before defining it
const Category =
  mongoose.models.Category ||
  mongoose.model(
    "Category",
    new mongoose.Schema(
      {
        name: { type: String, required: true, unique: true },
        description: { type: String },
      },
      { timestamps: true }
    )
  );

module.exports = Category;
