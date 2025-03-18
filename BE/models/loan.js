const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    loanDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    returnDate: { type: Date },
    status: {
      type: String,
      enum: ["borrowed", "returned"],
      default: "borrowed",
    },
  },
  { timestamps: true }
);

loanSchema.virtual("isOverdue").get(function () {
  if (this.status === "returned") return false;

  const dueDate =
    this.dueDate ||
    new Date(this.loanDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  return new Date() > dueDate;
});

loanSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// Check if the model already exists before defining it
const Loan = mongoose.models.Loan || mongoose.model("Loan", loanSchema);

module.exports = Loan;
