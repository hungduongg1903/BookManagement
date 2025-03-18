const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ 
        message: "User already exists with this email or username" 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      // Only set role if admin is creating user, otherwise default to "user"
      role: req.user && req.user.role === "admin" ? role || "user" : "user"
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Return user info without password
    const userWithoutPassword = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error registering user", 
      error: error.message 
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Check if email/username provided
    if (!email && !username) {
      return res.status(400).json({ 
        message: "Please provide email or username" 
      });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Return user info without password
    const userWithoutPassword = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.status(200).json({
      message: "Login successful",
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error logging in", 
      error: error.message 
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching user profile", 
      error: error.message 
    });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching users", 
      error: error.message 
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching user", 
      error: error.message 
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const updateData = {};

    // Only allow updating fields that were provided
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    
    // Only admin can update roles
    if (role && req.user.role === "admin") {
      updateData.role = role;
    }
    
    // If password is being updated, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Check if another user already has this username or email
    if (username || email) {
      const existingUser = await User.findOne({
        $or: [
          username ? { username } : { _id: null },
          email ? { email } : { _id: null }
        ],
        _id: { $ne: req.params.id }
      });

      if (existingUser) {
        return res.status(400).json({ 
          message: "Username or email already in use by another user" 
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "User updated successfully", 
      user: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error updating user", 
      error: error.message 
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ 
      message: "Error deleting user", 
      error: error.message 
    });
  }
};