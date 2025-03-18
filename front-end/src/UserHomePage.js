"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserHomePage = () => {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!token || !userId) {
      navigate("/login");
      return;
    }

    // Fetch user profile
    const fetchUserProfile = async () => {
      setLoadingUser(true);
      try {
        const response = await axios.get(`http://localhost:9999/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load user profile. Please try again or login.");
        if (error.response?.status === 401 || error.response?.status === 404) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          navigate("/login");
        }
      } finally {
        setLoadingUser(false);
      }
    };

    // Fetch books
    const fetchBooks = async () => {
      setLoadingBooks(true);
      try {
        const response = await axios.get("http://localhost:9999/books", { // Sửa URL thành /api/books
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooks(response.data);
      } catch (error) {
        console.error("Error fetching books:", error);
        toast.error("Failed to load books. Please try again.");
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchUserProfile();
    fetchBooks();
  }, [token, userId, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    toast.success("Logged out successfully!");
    setTimeout(() => navigate("/login"), 2000);
  };

  // Display loading if both APIs haven't completed
  if (loadingUser || loadingBooks) {
    return (
      <div className="container py-5">
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
          <div className="spinner-border text-success" style={{ width: "3rem", height: "3rem" }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading your library...</p>
        </div>
      </div>
    );
  }

  // Display error if user data failed to load
  if (!user) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-danger shadow-sm">
              <div className="card-body text-center p-5">
                <i className="bi bi-exclamation-circle text-danger" style={{ fontSize: "3rem" }}></i>
                <h3 className="mt-3 mb-3">Unable to load user data</h3>
                <p className="text-muted mb-4">Please login again to access your account.</p>
                <button className="btn btn-primary px-4 py-2" onClick={() => navigate("/login")}>
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header Section - Improved with better spacing and visual hierarchy */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="bg-success text-white rounded shadow p-4 p-md-5">
            <div className="row align-items-center">
              <div className="col-md-8 text-center text-md-start">
                <h1 className="display-5 fw-bold mb-0">Welcome, {user.username || "User"}!</h1>
                <p className="lead mt-2 mb-0 opacity-75">
                  <span className="badge bg-light text-success me-2">{user.role || "Member"}</span>
                  <span>{user.email || "No email provided"}</span>
                </p>
              </div>
              <div className="col-md-4 text-center text-md-end mt-3 mt-md-0">
                <button className="btn btn-outline-light px-4" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Book Collection - Improved card design and layout */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow border-0 mb-4">
            <div className="card-header bg-light py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0 fw-bold">Your Book Collection</h3>
                <span className="badge bg-success rounded-pill">{books.length} Books</span>
              </div>
            </div>
            <div className="card-body p-4">
              <p className="text-muted mb-4">
                Explore the books available in our library. Click on any book to view more details.
              </p>

              {/* Books Grid - Improved card design with consistent heights */}
              {books.length > 0 ? (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                  {books.map((book) => (
                    <div key={book._id} className="col">
                      <div className="card h-100 border-0 shadow-sm hover-shadow transition">
                        <div
                          className="card-img-top position-relative"
                          style={{ height: "300px", overflow: "hidden" }} // Giống BookDetails
                        >
                          {book.image ? (
                            <img
                              src={book.image}
                              alt={`${book.title} cover`}
                              className="img-fluid rounded-3"
                              style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "cover" }}
                              loading="lazy"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "block";
                              }}
                            />
                          ) : null}
                          <div
                            className="text-center p-4 border rounded bg-white"
                            style={{
                              display: book.image ? "none" : "block",
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                            }}
                          >
                            <i className="bi bi-book" style={{ fontSize: "5rem" }}></i>
                            <h5 className="mt-3">{book.title}</h5>
                          </div>
                        </div>
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title text-truncate fw-bold">{book.title}</h5>
                          <p className="card-text text-muted mb-1">by {book.author?.name || "Unknown Author"}</p>
                          <div className="d-flex justify-content-between align-items-center mt-2 mb-3">
                            <span className="badge bg-light text-dark">{book.category?.name || "Uncategorized"}</span>
                            <span className="small">Stock: {book.stock || 0}</span>
                          </div>
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center">
                              {book.available ? (
                                <span className="badge bg-success-subtle text-success px-3 py-2">Available</span>
                              ) : (
                                <span className="badge bg-danger-subtle text-danger px-3 py-2">Unavailable</span>
                              )}
                              <a href={`/book/${book._id}`} className="btn btn-outline-success">
                                View Details
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="bi bi-book" style={{ fontSize: "3rem", color: "#6c757d" }}></i>
                  </div>
                  <h4 className="text-muted">No books available at the moment</h4>
                  <p className="text-muted">Check back later for new additions to our library.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add this CSS to your component or in a separate CSS file
const styles = `
  .hover-shadow {
    transition: all 0.3s ease;
  }
  .hover-shadow:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
  }
  .transition {
    transition: all 0.3s ease;
  }
`;

export default function StyledUserHomePage() {
  return (
    <>
      <style>{styles}</style>
      <UserHomePage />
    </>
  );
}