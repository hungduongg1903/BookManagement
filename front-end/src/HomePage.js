"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const HomePage = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]); // Sửa lỗi: Dùng state đúng
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token || role !== "admin") {
      navigate("/user-home");
      return;
    }

    // Fetch danh sách sách
    axios
      .get("http://localhost:9999/books", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBooks(res.data))
      .catch((error) => {
        console.error("Error fetching books:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      });

    // Fetch danh mục sách
    axios
      .get("http://localhost:9999/categories", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCategories(res.data))
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, [token, role, navigate]);

  // Lọc sách theo tiêu chí tìm kiếm và danh mục
  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      (book.category?.name && book.category.name === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container py-5">
      {/* Header Section */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="bg-primary text-white rounded-3 shadow p-4 text-center">
            <h1 className="display-4 fw-bold">Book Library Management</h1>
            <p className="lead">Welcome, Admin</p>
            <button
              className="btn btn-outline-light mt-2"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("role");
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Category Filter Section */}
        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-light">
              <h5 className="mb-0">Filter by Category</h5>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column gap-2">
                {categories.map((category) => (
                  <div key={category._id} className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="category"
                      id={`category-${category.name}`}
                      value={category.name}
                      checked={selectedCategory === category.name}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`category-${category.name}`}
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
              <button
                className="btn btn-outline-secondary w-100 mt-3"
                onClick={() => setSelectedCategory("")}
              >
                Clear Filter
              </button>
              
              <button
                className="btn btn-outline-secondary w-100 mt-3"
                onClick={() => navigate("/manager-category")}
              >
                Manager Category
              </button>
            </div>
          </div>
        </div>

        {/* Book List Section */}
        <div className="col-md-9">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h3 className="mb-0">Book Collection</h3>
            </div>
            <div className="card-body">
              {/* Search and Add Book Section */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="input-group me-3" style={{ maxWidth: "70%" }}>
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setSearch("")}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <Link to="/create-book" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>Add New Book
                </Link>
              </div>

              {/* Books Table */}
              <div className="table-responsive">
                <table className="table table-hover table-striped border">
                  <thead className="table-primary">
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Stock</th>
                      <th>Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.length > 0 ? (
                      filteredBooks.map((book) => (
                        <tr key={book._id}>
                          <td className="fw-bold">
                            <Link
                              to={`/book/${book._id}`}
                              className="text-decoration-none"
                            >
                              {book.title}
                            </Link>
                          </td>
                          <td>{book.author?.name}</td>
                          <td>
                            <span className="badge bg-info text-dark">
                              {book.category?.name}
                            </span>
                          </td>
                          <td>
                            {book.description.length > 50
                              ? `${book.description.substring(0, 50)}...`
                              : book.description}
                          </td>
                          <td className="text-center">{book.stock}</td>
                          <td>
                            {book.available ? (
                              <span className="badge bg-success">
                                Available
                              </span>
                            ) : (
                              <span className="badge bg-danger">
                                Unavailable
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          No books found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Results Summary */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <span className="text-muted">
                  Showing {filteredBooks.length} of {books.length} books
                </span>
                {selectedCategory && (
                  <span className="badge bg-primary">
                    Filtered by: {selectedCategory}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
