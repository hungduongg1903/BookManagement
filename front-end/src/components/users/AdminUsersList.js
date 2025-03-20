// src/components/users/AdminUsersList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Form,
  InputGroup,
  Badge,
  Spinner,
  Alert,
  Modal,
  ButtonGroup,
  Dropdown,
  Card,
} from "react-bootstrap";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaFilter,
} from "react-icons/fa";

const AdminUsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all"); // "all", "admin", "user"

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:9999/users");
        setUsers(res.data);
      } catch (err) {
        setError("Không thể tải danh sách người dùng. Vui lòng thử lại sau.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilter = (role) => {
    setRoleFilter(role);
  };

  const filteredUsers = users.filter((user) => {
    // Lọc theo tìm kiếm
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Lọc theo vai trò
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await axios.delete(`http://localhost:9999/users/${userToDelete._id}`);
      setUsers(users.filter((user) => user._id !== userToDelete._id));
      setShowConfirmModal(false);
      setUserToDelete(null);
    } catch (err) {
      setError("Không thể xóa người dùng. Vui lòng thử lại.");
      console.error(err);
    }
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setUserToDelete(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "300px" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Body>
          <Row className="mb-4 align-items-center">
            <Col>
              <h2 className="mb-0">Quản lý người dùng</h2>
            </Col>
            <Col xs="auto">
              <Button as={Link} to="/users/create" variant="primary">
                <FaUserPlus className="me-2" />
                Thêm người dùng
              </Button>
            </Col>
          </Row>

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <Row className="mb-4">
            <Col md={6} className="mb-3 mb-md-0">
              <InputGroup>
                <Form.Control
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
              </InputGroup>
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-md-end">
                <Dropdown as={ButtonGroup}>
                  <Button variant="outline-secondary" disabled>
                    <FaFilter className="me-2" />
                    Lọc:{" "}
                    {roleFilter === "all"
                      ? "Tất cả"
                      : roleFilter === "admin"
                      ? "Admin"
                      : "Người dùng"}
                  </Button>
                  <Dropdown.Toggle
                    split
                    variant="outline-secondary"
                    id="dropdown-split-basic"
                  />
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleRoleFilter("all")}>
                      Tất cả
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleRoleFilter("admin")}>
                      Admin
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleRoleFilter("user")}>
                      Người dùng
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Col>
          </Row>

          {filteredUsers.length === 0 ? (
            <Alert variant="warning">
              Không tìm thấy người dùng nào phù hợp với tiêu chí tìm kiếm.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table striped hover bordered>
                <thead>
                  <tr>
                    <th>Tên người dùng</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="align-middle">{user.username}</td>
                      <td className="align-middle">{user.email}</td>
                      <td className="align-middle">
                        <Badge
                          bg={user.role === "admin" ? "primary" : "secondary"}
                        >
                          {user.role === "admin" ? "Admin" : "Người dùng"}
                        </Badge>
                      </td>
                      <td className="align-middle">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="align-middle">
                        <Button
                          as={Link}
                          to={`/users/edit/${user._id}`}
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                        >
                          <FaEdit /> Sửa
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteClick(user)}
                        >
                          <FaTrash /> Xóa
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal xác nhận xóa */}
      <Modal show={showConfirmModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Bạn có chắc chắn muốn xóa người dùng{" "}
            <strong>{userToDelete?.username}</strong>?
            <br />
            Hành động này không thể hoàn tác.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminUsersList;
