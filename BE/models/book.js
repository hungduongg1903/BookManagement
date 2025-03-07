const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "Author", required: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        description: { type: String },
        stock: { type: Number, default: 0 },
        available: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
