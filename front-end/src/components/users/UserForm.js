// src/components/users/UserForm.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
  Spinner,
  Tab,
  Nav,
  Table,
  Badge,
} from "react-bootstrap";
import {
  FaSave,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserTag,
  FaBook,
  FaCalendarAlt,
  FaInfoCircle,
} from "react-icons/fa";

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const [userLoans, setUserLoans] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [loanError, setLoanError] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validated, setValidated] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    const fetchUser = async () => {
      if (!isEditMode) return;

      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:9999/users/${id}`);
        const userData = res.data;

        setFormData({
          username: userData.username,
          email: userData.email,
          password: "",
          confirmPassword: "",
          role: userData.role,
        });
      } catch (err) {
        setError("Không thể tải thông tin người dùng. Vui lòng thử lại.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, isEditMode]);

  // Tải danh sách sách mượn khi người dùng chuyển sang tab "Sách đã mượn"
  useEffect(() => {
    const fetchUserLoans = async () => {
      if (!isEditMode || activeTab !== "loans") return;

      setLoadingLoans(true);
      setLoanError("");

      try {
        const res = await axios.get(`http://localhost:9999/users/${id}/loans`);
        setUserLoans(res.data);
      } catch (err) {
        setLoanError("Không thể tải danh sách sách đã mượn. Vui lòng thử lại.");
        console.error(err);
      } finally {
        setLoadingLoans(false);
      }
    };

    fetchUserLoans();
  }, [id, isEditMode, activeTab]);

  const { username, email, password, confirmPassword, role } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    setValidated(true);

    if (form.checkValidity() === false) {
      e.stopPropagation();
      return;
    }

    // Validation
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (!isEditMode && password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      // Chuẩn bị dữ liệu gửi đi
      const userData = {
        username,
        email,
        role,
      };

      // Chỉ gửi password nếu đã nhập hoặc đang tạo mới
      if (password || !isEditMode) {
        userData.password = password;
      }

      let res;
      if (isEditMode) {
        res = await axios.put(`http://localhost:9999/users/${id}`, userData);
        setSuccess("Cập nhật người dùng thành công!");
      } else {
        res = await axios.post(
          "http://localhost:9999/users/register",
          userData
        );
        setSuccess("Tạo người dùng thành công!");
      }

      // Chuyển hướng sau 1.5 giây
      setTimeout(() => {
        navigate("/users");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isEditMode ? "Lỗi cập nhật người dùng" : "Lỗi tạo người dùng")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const getLoanStatus = (loan) => {
    if (loan.status === "returned") {
      return <Badge bg="success">Đã trả</Badge>;
    } else if (loan.isOverdue) {
      return <Badge bg="danger">Quá hạn</Badge>;
    } else {
      return <Badge bg="primary">Đang mượn</Badge>;
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="d-flex justify-content-center">
          <Spinner animation="border" variant="primary" />
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                {isEditMode
                  ? "Quản lý người dùng: " + username
                  : "Thêm người dùng mới"}
              </h5>
            </Card.Header>
            <Card.Body>
              {isEditMode ? (
                <Tab.Container
                  id="user-tabs"
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                >
                  <Nav variant="tabs" className="mb-4">
                    <Nav.Item>
                      <Nav.Link eventKey="info">
                        <FaUser className="me-2" />
                        Thông tin người dùng
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="loans">
                        <FaBook className="me-2" />
                        Sách đã mượn
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <Tab.Content>
                    <Tab.Pane eventKey="info">{renderUserForm()}</Tab.Pane>
                    <Tab.Pane eventKey="loans">{renderUserLoans()}</Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              ) : (
                renderUserForm()
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );

  function renderUserForm() {
    return (
      <>
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-4">
            {success}
          </Alert>
        )}

        <Form noValidate validated={validated} onSubmit={onSubmit}>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3} className="text-sm-end">
              <FaUser className="me-2" />
              Tên người dùng
            </Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="username"
                value={username}
                onChange={onChange}
                required
                placeholder="Nhập tên người dùng"
              />
              <Form.Control.Feedback type="invalid">
                Vui lòng nhập tên người dùng
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3} className="text-sm-end">
              <FaEnvelope className="me-2" />
              Email
            </Form.Label>
            <Col sm={9}>
              <Form.Control
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                required
                placeholder="Nhập địa chỉ email"
              />
              <Form.Control.Feedback type="invalid">
                Vui lòng nhập địa chỉ email hợp lệ
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3} className="text-sm-end">
              <FaLock className="me-2" />
              Mật khẩu
            </Form.Label>
            <Col sm={9}>
              <Form.Control
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                required={!isEditMode}
                placeholder={
                  isEditMode
                    ? "Nhập mật khẩu mới hoặc để trống"
                    : "Nhập mật khẩu"
                }
              />
              <Form.Text className="text-muted">
                {isEditMode
                  ? "Để trống nếu không muốn thay đổi mật khẩu"
                  : "Mật khẩu phải có ít nhất 6 ký tự"}
              </Form.Text>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3} className="text-sm-end">
              <FaLock className="me-2" />
              Xác nhận mật khẩu
            </Form.Label>
            <Col sm={9}>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                required={!isEditMode || password !== ""}
                placeholder="Xác nhận mật khẩu"
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-4">
            <Form.Label column sm={3} className="text-sm-end">
              <FaUserTag className="me-2" />
              Vai trò
            </Form.Label>
            <Col sm={9}>
              <Form.Select
                name="role"
                value={role}
                onChange={onChange}
                required
              >
                <option value="user">Người dùng</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Col>
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button
              variant="secondary"
              className="me-2"
              onClick={() => navigate("/users")}
            >
              <FaTimes className="me-2" /> Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              <FaSave className="me-2" />
              {submitting
                ? isEditMode
                  ? "Đang cập nhật..."
                  : "Đang tạo..."
                : isEditMode
                ? "Cập nhật"
                : "Tạo người dùng"}
            </Button>
          </div>
        </Form>
      </>
    );
  }

  function renderUserLoans() {
    if (loadingLoans) {
      return (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
        </div>
      );
    }

    if (loanError) {
      return <Alert variant="danger">{loanError}</Alert>;
    }

    if (userLoans.length === 0) {
      return (
        <Alert variant="info">
          <FaInfoCircle className="me-2" />
          Người dùng này chưa mượn sách nào.
        </Alert>
      );
    }

    return (
      <>
        <h5 className="mb-3">Danh sách sách đã mượn</h5>
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Sách</th>
                <th>Ngày mượn</th>
                <th>Hạn trả</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {userLoans.map((loan) => (
                <tr key={loan.id}>
                  <td>
                    <div>
                      <p className="fw-bold mb-1">{loan.book.title}</p>
                      <p className="text-muted mb-0 small">
                        {loan.book.author
                          ? loan.book.author.name
                          : "Chưa có tác giả"}
                      </p>
                    </div>
                  </td>
                  <td>
                    <FaCalendarAlt className="text-muted me-2" />
                    {formatDate(loan.loanDate)}
                  </td>
                  <td>{loan.dueDate ? formatDate(loan.dueDate) : "N/A"}</td>

                  <td className="text-center">{getLoanStatus(loan)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </>
    );
  }
};

export default UserForm;
