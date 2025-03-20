// src/components/loans/AdminLoansList.js
import React, { useState, useEffect, useCallback } from "react";
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
  Card,
} from "react-bootstrap";
import {
  FaSearch,
  FaUserCircle,
  FaEnvelope,
  FaCalendarAlt,
  FaUndo,
  FaCalendarPlus,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEye,
  FaBook,
  FaPlus,
} from "react-icons/fa";

const API_BASE_URL = "http://localhost:9999";

const AdminLoansList = () => {
  const [loans, setLoans] = useState([]);
  const [allLoans, setAllLoans] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loanToReturn, setLoanToReturn] = useState(null);
  const [returnLoading, setReturnLoading] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    overdue: 0,
    returned: 0,
  });

  // Fetch all loans for stats
  const fetchAllLoans = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/loans`);
      setAllLoans(res.data);

      // Calculate stats from all loans
      const loanStats = {
        total: res.data.length,
        active: res.data.filter(
          (loan) => loan.status === "borrowed" && !loan.isOverdue
        ).length,
        overdue: res.data.filter((loan) => loan.isOverdue).length,
        returned: res.data.filter((loan) => loan.status === "returned").length,
      };
      setStats(loanStats);

      return res.data;
    } catch (err) {
      console.error("Error fetching all loans:", err);
      return [];
    }
  }, []);

  // Fetch loans data based on current tab
  const fetchLoans = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all loans first to get proper stats
      const allLoansData = await fetchAllLoans();

      // Then fetch the filtered data based on the current tab
      if (activeTab === "all") {
        setLoans(allLoansData);
      } else {
        let url = `${API_BASE_URL}/loans`;

        if (activeTab === "overdue") {
          url = `${API_BASE_URL}/loans/overdue`;
        }

        const res = await axios.get(url);

        if (activeTab === "active") {
          setLoans(
            res.data.filter(
              (loan) => loan.status === "borrowed" && !loan.isOverdue
            )
          );
        } else if (activeTab === "returned") {
          setLoans(res.data.filter((loan) => loan.status === "returned"));
        } else {
          setLoans(res.data);
        }
      }

      // Get unique user IDs
      const userIds = [
        ...new Set(
          allLoansData
            .map((loan) =>
              typeof loan.user === "string" ? loan.user : loan.user?._id
            )
            .filter((id) => id)
        ),
      ];

      // Fetch user details if needed
      if (userIds.length > 0) {
        const usersMap = { ...userDetails };
        let newUsersFetched = false;

        for (const userId of userIds) {
          if (!usersMap[userId]) {
            try {
              const userRes = await axios.get(
                `${API_BASE_URL}/users/${userId}`
              );
              usersMap[userId] = userRes.data;
              newUsersFetched = true;
            } catch (err) {
              console.warn(`Không thể lấy thông tin user ${userId}:`, err);
            }
          }
        }

        if (newUsersFetched) {
          setUserDetails(usersMap);
        }
      }

      setError("");
    } catch (err) {
      setError("Không thể tải danh sách mượn sách. Vui lòng thử lại sau.");
      console.error("Error fetching loans:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, fetchAllLoans, userDetails]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter loans by search term
  const getFilteredLoans = () => {
    return loans.filter((loan) => {
      const bookTitle = loan.book?.title?.toLowerCase() || "";
      const userId = typeof loan.user === "string" ? loan.user : loan.user?._id;
      const userInfo = userDetails[userId] || {};
      const username = userInfo.username?.toLowerCase() || "";
      const email = userInfo.email?.toLowerCase() || "";

      const searchQuery = searchTerm.toLowerCase();

      return (
        bookTitle.includes(searchQuery) ||
        username.includes(searchQuery) ||
        email.includes(searchQuery)
      );
    });
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Get user info from loan
  const getUserInfo = (loan) => {
    if (!loan || !loan.user) return { username: "Không xác định", email: "" };

    if (typeof loan.user === "object" && loan.user.username) {
      return {
        username: loan.user.username,
        email: loan.user.email || "",
      };
    }

    const userId = typeof loan.user === "string" ? loan.user : loan.user?._id;
    const userInfo = userDetails[userId];

    if (userInfo) {
      return {
        username: userInfo.username,
        email: userInfo.email || "",
      };
    }

    return {
      username: `ID: ${userId}`,
      email: "",
    };
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString("vi-VN", options);
    } catch (e) {
      return "Ngày không hợp lệ";
    }
  };

  // Handle return book
  const handleReturnClick = (loan) => {
    setLoanToReturn(loan);
    setShowConfirmModal(true);
  };

  // Confirm return book
  const confirmReturnBook = async () => {
    if (!loanToReturn) return;

    setReturnLoading(loanToReturn.id);
    setShowConfirmModal(false);

    try {
      await axios.put(`${API_BASE_URL}/loans/${loanToReturn.id}/return`);

      // Update the loans list
      setLoans(
        loans.map((loan) =>
          loan.id === loanToReturn.id
            ? {
                ...loan,
                status: "returned",
                returnDate: new Date().toISOString(),
              }
            : loan
        )
      );

      // Update all loans for stats
      setAllLoans(
        allLoans.map((loan) =>
          loan.id === loanToReturn.id
            ? {
                ...loan,
                status: "returned",
                returnDate: new Date().toISOString(),
              }
            : loan
        )
      );

      // Update statistics
      setStats((prev) => ({
        ...prev,
        active: prev.active - (loanToReturn.isOverdue ? 0 : 1),
        overdue: prev.overdue - (loanToReturn.isOverdue ? 1 : 0),
        returned: prev.returned + 1,
      }));
    } catch (err) {
      setError("Không thể cập nhật trạng thái. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setReturnLoading(null);
      setLoanToReturn(null);
    }
  };

  // Render loan status
  const renderLoanStatus = (loan) => {
    if (loan.status === "returned") {
      return (
        <Badge bg="success">
          <FaCheckCircle className="me-1" /> Đã trả
        </Badge>
      );
    } else if (loan.isOverdue) {
      return (
        <Badge bg="danger">
          <FaExclamationTriangle className="me-1" /> Quá hạn
        </Badge>
      );
    } else {
      return (
        <Badge bg="primary">
          <FaCalendarAlt className="me-1" /> Đang mượn
        </Badge>
      );
    }
  };

  // Render loan actions
  const renderLoanActions = (loan) => {
    return (
      <div className="d-flex gap-1">
        {loan.status === "borrowed" && (
          <Button
            variant="outline-success"
            size="sm"
            onClick={() => handleReturnClick(loan)}
            disabled={returnLoading === loan.id}
          >
            {returnLoading === loan.id ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <>
                <FaUndo className="me-1" /> Trả sách
              </>
            )}
          </Button>
        )}

        {loan.status === "borrowed" && (
          <Button
            as={Link}
            to={`/loans/${loan.id}/extend`}
            variant="outline-warning"
            size="sm"
          >
            <FaCalendarPlus className="me-1" /> Gia hạn
          </Button>
        )}

        <Button
          as={Link}
          to={`/loans/${loan.id}`}
          variant="outline-primary"
          size="sm"
        >
          <FaEye className="me-1" /> Chi tiết
        </Button>
      </div>
    );
  };

  if (loading && loans.length === 0) {
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
    <Container fluid className="py-4">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Quản lý mượn sách</h2>
            <Button
              as={Link}
              to="/create-loan"
              variant="success"
              className="d-flex align-items-center"
            >
              <FaPlus className="me-2" /> Tạo phiếu mượn mới
            </Button>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              <FaExclamationTriangle className="me-2" />
              {error}
            </Alert>
          )}

          {/* Dashboard stats */}
          <Row className="mb-4">
            <Col md={3} sm={6} className="mb-3 mb-md-0">
              <Card className="bg-light h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="rounded-circle p-3 bg-primary bg-opacity-10 me-3">
                    <FaBook className="text-primary" />
                  </div>
                  <div>
                    <h6 className="mb-0">Tổng số</h6>
                    <h3 className="mb-0">{stats.total}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3 mb-md-0">
              <Card className="bg-light h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="rounded-circle p-3 bg-primary bg-opacity-10 me-3">
                    <FaBook className="text-primary" />
                  </div>
                  <div>
                    <h6 className="mb-0">Đang mượn</h6>
                    <h3 className="mb-0">{stats.active}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3 mb-md-0">
              <Card className="bg-light h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="rounded-circle p-3 bg-danger bg-opacity-10 me-3">
                    <FaExclamationTriangle className="text-danger" />
                  </div>
                  <div>
                    <h6 className="mb-0">Quá hạn</h6>
                    <h3 className="mb-0">{stats.overdue}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="bg-light h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="rounded-circle p-3 bg-success bg-opacity-10 me-3">
                    <FaCheckCircle className="text-success" />
                  </div>
                  <div>
                    <h6 className="mb-0">Đã trả</h6>
                    <h3 className="mb-0">{stats.returned}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Search and filter */}
          <Row className="mb-4">
            <Col md={6} className="mb-3 mb-md-0">
              <InputGroup>
                <Form.Control
                  placeholder="Tìm kiếm theo tên sách hoặc người mượn..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
              </InputGroup>
            </Col>
            <Col md={6} className="d-flex justify-content-md-end">
              <ButtonGroup>
                <Button
                  variant={activeTab === "all" ? "primary" : "outline-primary"}
                  onClick={() => handleTabChange("all")}
                >
                  Tất cả
                </Button>
                <Button
                  variant={
                    activeTab === "active" ? "primary" : "outline-primary"
                  }
                  onClick={() => handleTabChange("active")}
                >
                  Đang mượn
                </Button>
                <Button
                  variant={
                    activeTab === "overdue" ? "primary" : "outline-primary"
                  }
                  onClick={() => handleTabChange("overdue")}
                >
                  Quá hạn
                </Button>
                <Button
                  variant={
                    activeTab === "returned" ? "primary" : "outline-primary"
                  }
                  onClick={() => handleTabChange("returned")}
                >
                  Đã trả
                </Button>
              </ButtonGroup>
            </Col>
          </Row>

          {/* Loan list */}
          {getFilteredLoans().length === 0 ? (
            <Alert variant="warning">
              <FaInfoCircle className="me-2" />
              Không tìm thấy phiếu mượn nào phù hợp với tiêu chí tìm kiếm.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover bordered className="align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>Sách</th>
                    <th>Người mượn</th>
                    <th>Ngày mượn</th>
                    <th>Hạn trả</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredLoans().map((loan) => {
                    const userInfo = getUserInfo(loan);
                    return (
                      <tr key={loan.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-light rounded p-2 me-2">
                              <FaBook className="text-primary" />
                            </div>
                            <div>
                              <p className="fw-bold mb-0">
                                {loan.book?.title || "Không có tiêu đề"}
                              </p>
                              <p className="text-muted mb-0 small">
                                {loan.book?.author?.name || "Chưa có tác giả"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-light rounded-circle p-2 me-2">
                              <FaUserCircle className="text-primary" />
                            </div>
                            <div>
                              <p className="fw-bold mb-0">
                                {userInfo.username}
                              </p>
                              {userInfo.email && (
                                <p className="text-muted mb-0 small">
                                  <FaEnvelope className="me-1" size="0.75em" />
                                  {userInfo.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaCalendarAlt className="text-muted me-2" />
                            {formatDate(loan.loanDate)}
                          </div>
                        </td>
                        <td>
                          {loan.dueDate ? formatDate(loan.dueDate) : "N/A"}
                        </td>

                        <td className="text-center">
                          {renderLoanStatus(loan)}
                        </td>
                        <td>{renderLoanActions(loan)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Confirm Return Modal */}
      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận trả sách</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loanToReturn && (
            <>
              <p>Bạn có chắc chắn muốn đánh dấu sách sau đã được trả:</p>
              <Card className="bg-light mb-3">
                <Card.Body>
                  <p className="fw-bold mb-1">{loanToReturn.book?.title}</p>
                  <p className="mb-1">
                    <span className="text-muted">Người mượn:</span>{" "}
                    {getUserInfo(loanToReturn).username}
                  </p>
                  <p className="mb-1">
                    <span className="text-muted">Ngày mượn:</span>{" "}
                    {formatDate(loanToReturn.loanDate)}
                  </p>
                  <p className="mb-0">
                    <span className="text-muted">Hạn trả:</span>{" "}
                    {formatDate(loanToReturn.dueDate)}
                  </p>
                </Card.Body>
              </Card>
              <p className="mb-0">
                Thao tác này không thể hoàn tác sau khi xác nhận.
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Hủy
          </Button>
          <Button variant="success" onClick={confirmReturnBook}>
            <FaCheckCircle className="me-1" />
            Xác nhận trả sách
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminLoansList;
