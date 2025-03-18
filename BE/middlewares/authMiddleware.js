const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticate = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "Không có token, vui lòng đăng nhập" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) return res.status(401).json({ message: "Người dùng không tồn tại" });

        next();
    } catch (error) {
        res.status(401).json({ message: "Token không hợp lệ" });
    }
};

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Bạn không có quyền truy cập!" });
    }
    next();
};

module.exports = { authenticate, authorizeAdmin };
