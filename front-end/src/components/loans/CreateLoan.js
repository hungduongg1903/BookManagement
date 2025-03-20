// src/components/loans/CreateLoan.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  ListGroup,
  InputGroup,
  Badge,
} from "react-bootstrap";
import {
  FaBook,
  FaUser,
  FaCalendarAlt,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

const API_BASE_URL = "http://localhost:9999";

const CreateLoan = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  // State
  const [book, setBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedBookData, setSelectedBookData] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [dueDate, setDueDate] = useState("");
  const [bookSearchTerm, setBookSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Set default due date (14 days from today)
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 14);
        setDueDate(defaultDueDate.toISOString().split("T")[0]);

        // Fetch book if bookId is provided
        if (bookId) {
          const bookRes = await axios.get(`${API_BASE_URL}/books/${bookId}`);
          setBook(bookRes.data);
          setSelectedBook(bookRes.data._id);
          setSelectedBookData(bookRes.data);
        } else {
          // Otherwise fetch available books
          const booksRes = await axios.get(`${API_BASE_URL}/books`);
          setBooks(
            booksRes.data.filter((book) => book.available && book.stock > 0)
          );
        }

        // Fetch users if admin
        if (isAdmin) {
          const usersRes = await axios.get(`${API_BASE_URL}/users`);
          setUsers(usersRes.data);
        }
      } catch (err) {
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [bookId, isAdmin]);

  // Filter books based on book search term
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
      (book.author?.name?.toLowerCase() || "").includes(
        bookSearchTerm.toLowerCase()
      )
  );

  // Filter users based on user search term
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Handle book selection
  const handleBookSelect = (selectedBook) => {
    // Find the book data based on ID
    const bookData = books.find((book) => book._id === selectedBook);
    setSelectedBook(selectedBook);
    setSelectedBookData(bookData);
    setBookSearchTerm(""); // Clear search after selection
  };

  // Handle user selection
  const handleUserSelect = (selectedUser) => {
    // Find the user data based on ID
    const userData = users.find((user) => user._id === selectedUser);
    setSelectedUser(selectedUser);
    setSelectedUserData(userData);
    setUserSearchTerm(""); // Clear search after selection
  };

  // Clear selected book
  const clearSelectedBook = (e) => {
    e.preventDefault(); // Prevent form submission
    setSelectedBook("");
    setSelectedBookData(null);
  };

  // Clear selected user
  const clearSelectedUser = (e) => {
    e.preventDefault(); // Prevent form submission
    setSelectedUser("");
    setSelectedUserData(null);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || (!selectedBook && !book)) {
      setError("Vui lòng chọn đầy đủ thông tin người mượn và sách");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await axios.post(`${API_BASE_URL}/loans/create`, {
        userId: selectedUser,
        bookId: selectedBook || book._id,
        dueDate: new Date(dueDate).toISOString(),
      });

      setSuccess("Tạo phiếu mượn thành công!");
      setTimeout(() => navigate("/admin/loans"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tạo phiếu mượn");
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

  return (
    <Container className="py-4">
      <Card>
        <Card.Header as="h5" className="bg-primary text-white">
          <FaBook className="me-2" /> Tạo phiếu mượn sách mới
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              {/* User selection */}
              <Col md={6} className="mb-4">
                <Card>
                  <Card.Header className="bg-light">
                    <FaUser className="me-2" /> Chọn người mượn
                  </Card.Header>
                  <Card.Body>
                    {isAdmin ? (
                      <>
                        {/* Display selected user */}
                        {selectedUserData && (
                          <Card className="mb-3">
                            <Card.Body className="py-2">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <div className="fw-bold">
                                    {selectedUserData.username}
                                  </div>
                                  <small>{selectedUserData.email}</small>
                                </div>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={clearSelectedUser}
                                >
                                  <FaTimes />
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        )}

                        {/* Search input - only show if no user is selected */}
                        {!selectedUserData && (
                          <>
                            <InputGroup className="mb-3">
                              <Form.Control
                                placeholder="Tìm kiếm người dùng..."
                                value={userSearchTerm}
                                onChange={(e) =>
                                  setUserSearchTerm(e.target.value)
                                }
                              />
                              <InputGroup.Text>
                                <FaSearch />
                              </InputGroup.Text>
                            </InputGroup>
                            <div
                              style={{ maxHeight: "250px", overflowY: "auto" }}
                            >
                              <ListGroup>
                                {filteredUsers.map((user) => (
                                  <ListGroup.Item
                                    key={user._id}
                                    action
                                    onClick={() => handleUserSelect(user._id)}
                                  >
                                    <div className="d-flex justify-content-between align-items-center">
                                      <div>
                                        <div className="fw-bold">
                                          {user.username}
                                        </div>
                                        <small>{user.email}</small>
                                      </div>
                                    </div>
                                  </ListGroup.Item>
                                ))}
                                {filteredUsers.length === 0 && (
                                  <ListGroup.Item className="text-muted text-center">
                                    Không tìm thấy người dùng
                                  </ListGroup.Item>
                                )}
                              </ListGroup>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <Alert variant="info">
                        Sách sẽ được mượn cho tài khoản hiện tại.
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Book selection or info */}
              <Col md={6} className="mb-4">
                <Card>
                  <Card.Header className="bg-light">
                    <FaBook className="me-2" />{" "}
                    {bookId ? "Thông tin sách" : "Chọn sách"}
                  </Card.Header>
                  <Card.Body>
                    {bookId && book ? (
                      <div>
                        <h5>{book.title}</h5>
                        <p>
                          <strong>Tác giả:</strong>{" "}
                          {book.author?.name || "Không có tác giả"}
                        </p>
                        <p>
                          <strong>Còn lại:</strong>{" "}
                          <Badge bg="info">{book.stock} cuốn</Badge>
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Display selected book */}
                        {selectedBookData && (
                          <Card className="mb-3">
                            <Card.Body className="py-2">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <div className="fw-bold">
                                    {selectedBookData.title}
                                  </div>
                                  <small>
                                    {selectedBookData.author?.name ||
                                      "Không có tác giả"}
                                  </small>
                                  <div>
                                    <Badge bg="info">
                                      {selectedBookData.stock} cuốn
                                    </Badge>
                                  </div>
                                </div>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={clearSelectedBook}
                                >
                                  <FaTimes />
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        )}

                        {/* Search input - only show if no book is selected */}
                        {!selectedBookData && (
                          <>
                            <InputGroup className="mb-3">
                              <Form.Control
                                placeholder="Tìm kiếm sách..."
                                value={bookSearchTerm}
                                onChange={(e) =>
                                  setBookSearchTerm(e.target.value)
                                }
                              />
                              <InputGroup.Text>
                                <FaSearch />
                              </InputGroup.Text>
                            </InputGroup>
                            <div
                              style={{ maxHeight: "250px", overflowY: "auto" }}
                            >
                              <ListGroup>
                                {filteredBooks.map((book) => (
                                  <ListGroup.Item
                                    key={book._id}
                                    action
                                    onClick={() => handleBookSelect(book._id)}
                                  >
                                    <div className="d-flex justify-content-between align-items-center">
                                      <div>
                                        <div className="fw-bold">
                                          {book.title}
                                        </div>
                                        <small>
                                          {book.author?.name ||
                                            "Không có tác giả"}
                                        </small>
                                      </div>
                                      <Badge bg="info">{book.stock}</Badge>
                                    </div>
                                  </ListGroup.Item>
                                ))}
                                {filteredBooks.length === 0 && (
                                  <ListGroup.Item className="text-muted text-center">
                                    Không tìm thấy sách
                                  </ListGroup.Item>
                                )}
                              </ListGroup>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Loan information */}
            <Card className="mb-4">
              <Card.Header className="bg-light">
                <FaCalendarAlt className="me-2" /> Thông tin mượn
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Label>Ngày hạn trả</Form.Label>
                  <Form.Control
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                  <Form.Text className="text-muted">
                    Mặc định là 14 ngày kể từ ngày hiện tại
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Action buttons */}
            <div className="d-flex justify-content-between">
              <Button
                variant="secondary"
                onClick={() => navigate("/admin/loans")}
              >
                Quay lại
              </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={
                  submitting || (!book && !selectedBook) || !selectedUser
                }
              >
                {submitting ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : null}
                {submitting ? "Đang xử lý..." : "Tạo phiếu mượn"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateLoan;
