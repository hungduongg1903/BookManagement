// src/components/loans/UserLoans.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Table,
  Badge,
  Button,
  Spinner,
  Alert,
  Card,
} from "react-bootstrap";
import {
  FaBook,
  FaCalendarAlt,
  FaExclamationCircle,
  FaInfoCircle,
  FaArrowRight,
  FaUser,
  FaCheck,
  FaExchangeAlt,
} from "react-icons/fa";

const UserLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returnLoading, setReturnLoading] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUserLoans = async () => {
      try {
        // Đảm bảo currentUser và currentUser._id tồn tại
        if (!currentUser || !currentUser._id) {
          throw new Error("Thông tin người dùng không khả dụng");
        }

        const res = await axios.get(
          `http://localhost:9999/users/${currentUser._id}/loans`
        );

        // Thêm các dòng này để kiểm tra dữ liệu
        console.log("Toàn bộ dữ liệu loans:", res.data);

        if (res.data && res.data.length > 0) {
          console.log(
            "Chi tiết loan đầu tiên:",
            JSON.stringify(res.data[0], null, 2)
          );
          console.log("Thông tin user trong loan:", res.data[0].user);
        }

        setLoans(res.data);
      } catch (err) {
        setError("Không thể tải danh sách sách đã mượn. Vui lòng thử lại sau.");
        console.error("Error fetching loans:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUserLoans();
    } else {
      setLoading(false);
      setError("Vui lòng đăng nhập để xem sách đã mượn");
    }
  }, [currentUser]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const getLoanStatus = (loan) => {
    if (!loan) return null;

    if (loan.status === "returned") {
      return <Badge bg="success">Đã trả</Badge>;
    } else if (loan.isOverdue) {
      return <Badge bg="danger">Quá hạn</Badge>;
    } else {
      return <Badge bg="primary">Đang mượn</Badge>;
    }
  };

  const handleReturnBook = async (loanId) => {
    if (
      window.confirm("Bạn có chắc chắn muốn đánh dấu sách này đã được trả?")
    ) {
      setReturnLoading(loanId);
      try {
        await axios.put(`http://localhost:9999/loans/update/${loanId}`, {
          status: "returned",
        });

        // Cập nhật danh sách mượn
        setLoans(
          loans.map((loan) =>
            loan.id === loanId
              ? {
                  ...loan,
                  status: "returned",
                  returnDate: new Date().toISOString(),
                }
              : loan
          )
        );
      } catch (err) {
        alert("Không thể cập nhật trạng thái. Vui lòng thử lại.");
        console.error(err);
      } finally {
        setReturnLoading(null);
      }
    }
  };

  // Hiển thị thông tin người dùng an toàn
  const renderUserInfo = (loan) => {
    // Kiểm tra xem loan và loan.user có tồn tại không
    if (!loan || !loan.user) {
      return (
        <div className="text-muted small">
          <FaUser className="me-2" />
          Không có thông tin người dùng
        </div>
      );
    }

    return (
      <div className="d-flex align-items-center">
        <FaUser className="text-primary me-2" />
        <div>
          <p className="fw-bold mb-0">{loan.user.username || "Không có tên"}</p>
          <p className="text-muted mb-0 small">
            {loan.user.email || "Không có email"}
          </p>
        </div>
      </div>
    );
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

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <FaExclamationCircle className="me-2" /> {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Body>
          <h2 className="mb-4">
            <FaBook className="me-2" />
            Sách đã mượn
          </h2>

          {!loans || loans.length === 0 ? (
            <Alert variant="warning">
              <FaInfoCircle className="me-2" />
              Bạn chưa mượn sách nào.
              <div className="mt-2">
                <Button
                  as={Link}
                  to="/home"
                  variant="outline-primary"
                  size="sm"
                >
                  Xem danh sách sách
                </Button>
              </div>
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table striped hover bordered>
                <thead>
                  <tr>
                    <th>Sách</th>
                    <th>Người mượn</th>
                    <th>Ngày mượn</th>
                    <th>Hạn trả</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan?.id || Math.random()}>
                      <td>
                        <div>
                          <p className="fw-bold mb-1">
                            {loan?.book?.title || "Không có tiêu đề"}
                          </p>
                          <p className="text-muted mb-0 small">
                            {loan?.book?.author?.name || "Chưa có tác giả"}
                          </p>
                        </div>
                      </td>
                      <td>{renderUserInfo(loan)}</td>
                      <td>
                        <FaCalendarAlt className="text-muted me-2" />
                        {formatDate(loan?.loanDate)}
                      </td>
                      <td>
                        <span
                          className={
                            loan?.isOverdue && loan?.status !== "returned"
                              ? "text-danger fw-bold"
                              : ""
                          }
                        >
                          {formatDate(loan?.dueDate)}
                        </span>
                      </td>
                      <td className="text-center">{getLoanStatus(loan)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserLoans;
