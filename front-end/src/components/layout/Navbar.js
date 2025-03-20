// src/components/layout/Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import {
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
  FaBook,
  FaUser,
} from "react-icons/fa";
// import { useAuth } from "../../context/AuthContext"; // Import useAuth hook khi đã tích hợp

const AppNavbar = () => {
  const navigate = useNavigate();

  // Sử dụng AuthContext khi đã tích hợp
  // const { currentUser, isAuthenticated, logout } = useAuth();

  // Sử dụng localStorage tạm thời
  const isAuthenticated = localStorage.getItem("token") ? true : false;
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser?.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Navbar bg="primary" variant="dark" expand="md" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/home" className="fw-bold">
          Thư Viện
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/home">
              Trang chủ
            </Nav.Link>

            {isAuthenticated && (
              <Nav.Link as={Link} to="/loans">
                <FaBook className="me-1" /> Sách đã mượn
              </Nav.Link>
            )}

            {isAdmin && (
              <>
                <Nav.Link as={Link} to="/admin/loans">
                  Quản lý mượn sách
                </Nav.Link>
                <Nav.Link as={Link} to="/create-book">
                  Thêm sách
                </Nav.Link>
                <Nav.Link as={Link} to="/users">
                  Quản lý người dùng
                </Nav.Link>
              </>
            )}
          </Nav>

          <Nav>
            {isAuthenticated ? (
              <>
                <Navbar.Text className="me-2">
                  <FaUser className="me-1" /> Xin chào, {currentUser.username}
                </Navbar.Text>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogout}
                  className="d-flex align-items-center"
                >
                  <FaSignOutAlt className="me-1" /> Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Nav.Link
                  as={Link}
                  to="/login"
                  className="d-flex align-items-center"
                >
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="d-flex align-items-center"
                  >
                    <FaSignInAlt className="me-1" /> Đăng nhập
                  </Button>
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/register"
                  className="d-flex align-items-center"
                >
                  <Button
                    variant="light"
                    size="sm"
                    className="d-flex align-items-center"
                  >
                    <FaUserPlus className="me-1" /> Đăng ký
                  </Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
