"use client";

import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
// Thêm react-toastify để hiển thị thông báo
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token"); // Lấy token
  const role = localStorage.getItem("role"); // Lấy role

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:9999/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` }, // Thêm header token
      })
      .then((res) => {
        setBook(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching book details:", error);
        // Hiển thị thông báo lỗi chi tiết từ backend nếu có
        const errorMessage =
          error.response?.data?.message ||
          "Failed to load book details. Please try again later.";
        setError(errorMessage);
        setLoading(false);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("role");
          navigate("/login");
        }
      });
  }, [id, navigate, token]);

  // Hàm xóa sách
  const handleDelete = async () => {
    // Xác nhận trước khi xóa
    if (!window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:9999/books/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }, // Thêm header token
      });
      toast.success("Book deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      // Chuyển hướng về danh sách sách sau khi xóa
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      console.error("Error deleting book:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to delete book. Please try again later.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading book details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Back to Book List
        </button>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning" role="alert">
          Book not found
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Back to Book List
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Thêm ToastContainer để hiển thị thông báo */}
      <ToastContainer />

      {/* Back Button */}
      <div className="mb-4">
        <button className="btn btn-outline-primary" onClick={() => navigate("/")}>
          ← Back to Book List
        </button>
      </div>

      {/* Book Details Card */}
      <div className="card shadow-lg border-0">
        <div className="card-header bg-primary text-white py-3">
          <h1 className="mb-0">{book.title}</h1>
        </div>

        <div className="card-body p-4">
          <div className="row">
            {/* Book Cover */}
            <div className="col-md-4 mb-4 mb-md-0">
              <div
                className="bg-light rounded-3 d-flex justify-content-center align-items-center overflow-hidden"
                style={{ height: "300px", position: "relative" }}
              >
                {book.image ? (
                  <img
                    src={book.image}
                    alt={book.title}
                    className="img-fluid rounded-3"
                    style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "block";
                    }}
                  />
                ) : null}
                <div
                  className="text-center p-4"
                  style={{ display: book.image ? "none" : "block", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                >
                  <i className="bi bi-book" style={{ fontSize: "5rem" }}></i>
                  <h5 className="mt-3">{book.title}</h5>
                </div>
              </div>

              <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold">Status:</span>
                  {book.available ? (
                    <span className="badge bg-success px-3 py-2">Available</span>
                  ) : (
                    <span className="badge bg-danger px-3 py-2">Unavailable</span>
                  )}
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">In Stock:</span>
                  <span className="badge bg-secondary px-3 py-2">{book.stock} copies</span>
                </div>
              </div>
            </div>

            {/* Book Information */}
            <div className="col-md-8">
              <div className="mb-4">
                <h2 className="h5 text-muted mb-3">Author</h2>
                <p className="fs-4">{book.author?.name || "Unknown"}</p>
              </div>

              <div className="mb-4">
                <h2 className="h5 text-muted mb-3">Category</h2>
                <span className="badge bg-info text-dark px-3 py-2 fs-6">{book.category?.name || "Uncategorized"}</span>
              </div>

              <div className="mb-4">
                <h2 className="h5 text-muted mb-3">Description</h2>
                <div className="p-3 bg-light rounded-3">
                  <p className="mb-0">{book.description || "No description available."}</p>
                </div>
              </div>

              {/* Additional Details */}
              <div className="row mt-4">
                <div className="col-md-6 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">ISBN</h5>
                      <p className="card-text">{book.isbn || "Not available"}</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Publication Year</h5>
                      <p className="card-text">{book.publicationYear || "Not available"}</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Publisher</h5>
                      <p className="card-text">{book.publisher || "Not available"}</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Pages</h5>
                      <p className="card-text">{book.pages || "Not available"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card-footer bg-white p-4 border-top">
          <div className="d-flex justify-content-end gap-2">
            {role === "admin" && (
              <>
                <Link to={`/edit-book/${book._id}`} className="btn btn-warning">
                  <i className="bi bi-pencil me-2"></i>Edit Book
                </Link>
                <button className="btn btn-danger" onClick={handleDelete}>
                  <i className="bi bi-trash me-2"></i>Delete Book
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;