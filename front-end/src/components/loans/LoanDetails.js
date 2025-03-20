// src/components/loans/LoanDetails.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaBook,
  FaUser,
  FaCalendarAlt,
  FaCalendarCheck,
  FaCalendarPlus,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";

const API_BASE_URL = "http://localhost:9999";

const LoanDetails = () => {
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returnLoading, setReturnLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/loans/${id}`);
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
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const handleReturnBook = async () => {
    if (
      window.confirm("Bạn có chắc chắn muốn đánh dấu sách này đã được trả?")
    ) {
      setReturnLoading(true);
      try {
        const res = await axios.put(`${API_BASE_URL}/loans/update/${id}`, {
          status: "returned",
        });
        setLoan(res.data.loan);
      } catch (err) {
        alert("Không thể cập nhật trạng thái sách. Vui lòng thử lại.");
        console.error(err);
      } finally {
        setReturnLoading(false);
      }
    }
  };

  const renderLoanStatus = () => {
    if (!loan) return null;

    if (loan.status === "returned") {
      return (
        <Badge bg="success">
          <FaCheckCircle className="me-1" /> Đã trả
        </Badge>
      );
    } else if (loan.isOverdue) {
      return <Badge bg="danger">Quá hạn</Badge>;
    } else {
      return <Badge bg="primary">Đang mượn</Badge>;
    }
  };

  const isAdmin = currentUser?.role === "admin";

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

  if (error || !loan) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {error || "Không tìm thấy thông tin mượn sách"}
        </Alert>
        <Button variant="primary" onClick={() => navigate("/loans")}>
          <FaArrowLeft className="me-2" />
          Quay lại danh sách mượn
        </Button>
      </Container>
    );
  }

  // Kiểm tra quyền truy cập
  if (!isAdmin && loan.user._id !== currentUser._id) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          Bạn không có quyền xem thông tin mượn sách này.
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
      <h2 className="mb-4">Chi tiết mượn sách</h2>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Card className="border-0">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                      <FaBook className="text-primary" />
                    </div>
                    <h5 className="mb-0">Thông tin sách</h5>
                  </div>

                  <div className="ps-2">
                    <div className="mb-3">
                      <div className="text-muted small">Tiêu đề:</div>
                      <div className="fw-bold">{loan.book.title}</div>
                    </div>

                    <div className="mb-3">
                      <div className="text-muted small">Tác giả:</div>
                      <div>
                        {loan.book.author
                          ? loan.book.author.name
                          : "Chưa có tác giả"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-muted small">Thể loại:</div>
                      <div>
                        {loan.book.category
                          ? loan.book.category.name
                          : "Chưa phân loại"}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="border-0">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                      <FaCalendarAlt className="text-primary" />
                    </div>
                    <h5 className="mb-0">Thông tin mượn</h5>
                  </div>

                  <div className="ps-2">
                    <div className="mb-3">
                      <div className="text-muted small">Trạng thái:</div>
                      <div>{renderLoanStatus()}</div>
                    </div>

                    <div className="mb-3">
                      <div className="text-muted small">Ngày mượn:</div>
                      <div className="d-flex align-items-center">
                        <FaCalendarAlt className="text-muted me-2" />
                        {formatDate(loan.loanDate)}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-muted small">Hạn trả:</div>
                      <div className="d-flex align-items-center">
                        <FaCalendarCheck className="text-muted me-2" />
                        {formatDate(loan.dueDate)}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card> 
            </Col>
          </Row>

          {isAdmin && (
            <Row className="mt-4">
              <Col>
                <Card className="border-0 bg-light">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                        <FaUser className="text-primary" />
                      </div>
                      <h5 className="mb-0">Thông tin người dùng</h5>
                    </div>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <div className="text-muted small">
                            Tên người dùng:
                          </div>
                          <div className="fw-bold">{loan.user.username}</div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <div className="text-muted small">Email:</div>
                          <div>{loan.user.email}</div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          <div className="d-flex justify-content-end mt-4 gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate(isAdmin ? "/admin/loans" : "/loans")}
            >
              <FaArrowLeft className="me-2" />
              Quay lại
            </Button>

            {loan.status === "borrowed" && (
              <>
                <Button
                  variant="success"
                  onClick={() => navigate(`/loans/${loan.id}/extend`)}
                >
                  <FaCalendarPlus className="me-2" />
                  Gia hạn
                </Button>

                {isAdmin && (
                  <Button
                    variant="primary"
                    onClick={handleReturnBook}
                    disabled={returnLoading}
                  >
                    {returnLoading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <>
                        <FaCheckCircle className="me-2" />
                        Đánh dấu đã trả
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoanDetails;
