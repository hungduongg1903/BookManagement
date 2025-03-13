const mongoose = require("mongoose");

// Check if the model already exists before defining it
const User =
  mongoose.models.User ||
  mongoose.model(
    "User",
    new mongoose.Schema(
      {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["user", "admin"], default: "user" },
      },
      { timestamps: true }
    )
  );

module.exports = User;
