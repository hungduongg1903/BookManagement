const mongoose = require("mongoose");

// Check if the model already exists before defining it
const Author =
  mongoose.models.Author ||
  mongoose.model(
    "Author",
    new mongoose.Schema(
      {
        name: { type: String, required: true },
        birthYear: { type: Number },
        nationality: { type: String },
      },
      { timestamps: true }
    )
  );

module.exports = Author;
