const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        birthYear: { type: Number },
        nationality: { type: String }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Author", authorSchema);
