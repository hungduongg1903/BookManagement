// src/components/loans/ExtendLoan.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  ListGroup,
  Badge,
} from "react-bootstrap";
import {
  FaCalendarAlt,
  FaBookOpen,
  FaUserEdit,
  FaCalendarPlus,
  FaArrowLeft,
  FaExclamationTriangle,
  FaUser,
  FaEnvelope,
  FaIdCard,
} from "react-icons/fa";

const ExtendLoan = () => {
  const [loan, setLoan] = useState(null);
  const [extensionDays, setExtensionDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const res = await axios.get(`http://localhost:9999/loans/${id}`);
        setLoan(res.data);
      } catch (err) {
        setError("Không thể tải thông tin mượn sách. Vui lòng thử lại sau.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoan();
  }, [id]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const calculateNewDueDate = () => {
    if (!loan || !loan.dueDate) return "Không xác định";

    const dueDate = new Date(loan.dueDate);
    const newDueDate = new Date(dueDate);
    newDueDate.setDate(dueDate.getDate() + Number(extensionDays));

    return formatDate(newDueDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.put(`http://localhost:9999/loans/${id}/extend`, {
        extensionDays: Number(extensionDays),
      });

      setSuccess("Gia hạn mượn sách thành công!");
      setLoan(res.data.loan);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/loans");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Không thể gia hạn. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
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

  if (error && !loan) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <FaExclamationTriangle className="me-2" />
          {error}
        </Alert>
        <Button variant="primary" onClick={() => navigate("/loans")}>
          <FaArrowLeft className="me-2" />
          Quay lại danh sách mượn
        </Button>
      </Container>
    );
  }

  if (!loan) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <FaExclamationTriangle className="me-2" />
          Không tìm thấy thông tin mượn sách
        </Alert>
        <Button variant="primary" onClick={() => navigate("/loans")}>
          <FaArrowLeft className="me-2" />
          Quay lại danh sách mượn
        </Button>
      </Container>
    );
  }

  if (loan.status === "returned") {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          <FaExclamationTriangle className="me-2" />
          Sách này đã được trả. Bạn không thể gia hạn mượn sách đã trả.
        </Alert>
        <Button variant="primary" onClick={() => navigate("/loans")}>
          <FaArrowLeft className="me-2" />
          Quay lại danh sách mượn
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">
            <FaCalendarPlus className="me-2" />
            Gia hạn mượn sách
          </h4>
        </Card.Header>
        <Card.Body>
          {success && (
            <Alert variant="success" className="mb-4">
              {success}
            </Alert>
          )}

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Thông tin người mượn */}
          <div className="mb-4">
            <h5 className="mb-3">
              <FaUser className="me-2" />
              Thông tin người mượn
            </h5>

            <Card className="bg-light border-0">
              <Card.Body>
                <Row>
                  <Col md={6} className="mb-3 mb-md-0">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary text-white p-3 rounded-circle me-3">
                        <FaUser />
                      </div>
                      <div>
                        <h6 className="mb-1">Người mượn</h6>
                        <p className="mb-0 fw-bold">{loan.user.username}</p>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex align-items-center">
                      <div className="bg-info text-white p-3 rounded-circle me-3">
                        <FaEnvelope />
                      </div>
                      <div>
                        <h6 className="mb-1">Email</h6>
                        <p className="mb-0">{loan.user.email}</p>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </div>

          <h5 className="mb-3">
            <FaBookOpen className="me-2" />
            Thông tin sách
          </h5>

          <ListGroup className="mb-4">
            <ListGroup.Item>
              <Row>
                <Col md={6}>
                  <div className="mb-3 mb-md-0">
                    <div className="text-muted small">Sách:</div>
                    <div className="fw-bold">{loan.book.title}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div>
                    <div className="text-muted small">Tác giả:</div>
                    <div>
                      {loan.book.author
                        ? loan.book.author.name
                        : "Chưa có tác giả"}
                    </div>
                  </div>
                </Col>
              </Row>
            </ListGroup.Item>

            <ListGroup.Item>
              <Row>
                <Col md={6}>
                  <div className="mb-3 mb-md-0">
                    <div className="text-muted small">Ngày mượn:</div>
                    <div>
                      <FaCalendarAlt className="text-muted me-2" />
                      {formatDate(loan.loanDate)}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div>
                    <div className="text-muted small">Hạn trả hiện tại:</div>
                    <div>
                      <FaCalendarAlt className="text-warning me-2" />
                      {loan.dueDate ? formatDate(loan.dueDate) : "N/A"}
                    </div>
                  </div>
                </Col>
              </Row>
            </ListGroup.Item>

            <ListGroup.Item>
              <Row>
                <Col md={6}>
                  <div className="mb-3 mb-md-0">
                    <div className="text-muted small">Mã phiếu mượn:</div>
                    <div>
                      <FaIdCard className="text-muted me-2" />
                      {loan.id}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div>
                    <div className="text-muted small">Trạng thái:</div>
                    <div>
                      <Badge bg="primary">Đang mượn</Badge>
                    </div>
                  </div>
                </Col>
              </Row>
            </ListGroup.Item>
          </ListGroup>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4" controlId="extensionDays">
              <Form.Label>
                <FaUserEdit className="me-2" />
                Thời gian gia hạn (ngày)
              </Form.Label>
              <Form.Select
                value={extensionDays}
                onChange={(e) => setExtensionDays(e.target.value)}
              >
                <option value="7">7 ngày</option>
                <option value="14">14 ngày</option>
                <option value="21">21 ngày</option>
              </Form.Select>
            </Form.Group>

            <div className="mb-4 p-3 bg-light rounded">
              <div className="text-muted small">Hạn trả mới:</div>
              <div className="text-primary fw-bold fs-5">
                <FaCalendarAlt className="me-2" />
                {calculateNewDueDate()}
              </div>
            </div>

            <div className="d-flex justify-content-between">
              <Button
                variant="secondary"
                onClick={() => navigate("/admin/loans")}
              >
                <FaArrowLeft className="me-2" />
                Hủy
              </Button>

              <Button type="submit" variant="primary" disabled={submitting}>
                <FaCalendarPlus className="me-2" />
                {submitting ? "Đang xử lý..." : "Gia hạn mượn sách"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ExtendLoan;
