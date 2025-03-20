const Loan = require("../models/loan");
const Book = require("../models/book");
const User = require("../models/user");

// Create a new loan
exports.createLoan = async (req, res) => {
  try {
    const { userId, bookId, dueDate } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if book exists and is available
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!book.available || book.stock <= 0) {
      return res
        .status(400)
        .json({ message: "Book is not available for loan" });
    }

    // Create a new loan
    const loan = new Loan({
      user: userId,
      book: bookId,
      loanDate: new Date(),
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default: 14 days from now
      status: "borrowed",
    });

    await loan.save();

    // Update book stock and availability
    book.stock -= 1;
    if (book.stock === 0) {
      book.available = false;
    }
    await book.save();

    res.status(201).json({
      message: "Loan created successfully",
      loan: await Loan.findById(loan._id).populate("user").populate("book"),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating loan", error: error.message });
  }
};

// Get all loans
exports.getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate("user", "username email")
      .populate({
        path: "book",
        populate: {
          path: "author category",
          select: "name",
        },
      });

    res.status(200).json(loans);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching loans", error: error.message });
  }
};

// Get loan by ID
exports.getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate("user", "username email")
      .populate({
        path: "book",
        populate: {
          path: "author category",
          select: "name",
        },
      });

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.status(200).json(loan);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching loan", error: error.message });
  }
};

// Update loan status
exports.updateLoanStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["borrowed", "returned"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    loan.status = status;

    // If returning the book, update returnDate and book stock
    if (status === "returned" && loan.status !== "returned") {
      loan.returnDate = new Date();

      const book = await Book.findById(loan.book);
      if (book) {
        book.stock += 1;
        book.available = true;
        await book.save();
      }
    }

    await loan.save();

    res.status(200).json({ message: "Loan status updated successfully", loan });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating loan status", error: error.message });
  }
};

// Return a book
exports.returnBook = async (req, res) => {
  try {
    console.log("Return book request received for loan ID:", req.params.id);

    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      console.log("Loan not found with ID:", req.params.id);
      return res.status(404).json({ message: "Loan not found" });
    }

    console.log("Found loan:", loan);

    if (loan.status === "returned") {
      return res.status(400).json({ message: "Book already returned" });
    }

    // Update loan status
    loan.status = "returned";
    loan.returnDate = new Date();
    await loan.save();
    console.log("Loan updated to returned status");

    // Update book availability
    const bookId = loan.book;
    console.log("Looking for book with ID:", bookId);

    const book = await Book.findById(bookId);
    if (book) {
      console.log("Found book:", book.title, "Current stock:", book.stock);
      book.stock += 1;
      book.available = true;
      await book.save();  
      console.log("Book stock updated to:", book.stock);
    } else {
      console.log("Book not found with ID:", bookId);
    }

    res.status(200).json({
      message: "Book returned successfully",
      loan,
      bookUpdated: !!book,
    });
  } catch (error) {
    console.error("Error returning book:", error);
    res
      .status(500)
      .json({ message: "Error returning book", error: error.message });
  }
};

// Extend loan duration
exports.extendLoan = async (req, res) => {
  try {
    const { extensionDays } = req.body;

    if (!extensionDays || extensionDays <= 0) {
      return res
        .status(400)
        .json({ message: "Please provide a valid extension period" });
    }

    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (loan.status === "returned") {
      return res.status(400).json({ message: "Cannot extend a returned loan" });
    }

    // Check if loan is already overdue
    const currentDate = new Date();
    const dueDate =
      loan.dueDate ||
      new Date(loan.loanDate.getTime() + 14 * 24 * 60 * 60 * 1000);

    if (currentDate > dueDate) {
      return res.status(400).json({ message: "Cannot extend an overdue loan" });
    }

    // Extend due date
    loan.dueDate = new Date(
      dueDate.getTime() + extensionDays * 24 * 60 * 60 * 1000
    );
    await loan.save();

    res.status(200).json({ message: "Loan extended successfully", loan });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error extending loan", error: error.message });
  }
};

// Get loans by user ID
exports.getUserLoans = async (req, res) => {
  try {
    const userId = req.params.id;
    const loans = await Loan.find({ user: userId })
      .populate("user", "username email") // Thêm populate user
      .populate({
        path: "book",
        populate: {
          path: "author category",
          select: "name",
        },
      })
      .sort({ loanDate: -1 });

    res.status(200).json(loans);
  } catch (error) {
    // xử lý lỗi
  }
};

// Get overdue loans
exports.getOverdueLoans = async (req, res) => {
  try {
    const currentDate = new Date();

    // Find loans where dueDate is less than current date and status is still "borrowed"
    const overdueLoans = await Loan.find({
      $or: [
        { dueDate: { $lt: currentDate }, status: "borrowed" },
        {
          dueDate: { $exists: false },
          loanDate: { $lt: new Date(currentDate - 14 * 24 * 60 * 60 * 1000) },
          status: "borrowed",
        },
      ],
    })
      .populate("user", "username email")
      .populate({
        path: "book",
        populate: {
          path: "author category",
          select: "name",
        },
      });

    res.status(200).json(overdueLoans);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching overdue loans", error: error.message });
  }
};
