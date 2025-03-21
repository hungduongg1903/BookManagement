"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "bootstrap/dist/css/bootstrap.min.css"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const CreateBook = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    description: "",
    stock: 1,
    isbn: "",
    publicationYear: new Date().getFullYear(),
    publisher: "",
    pages: "",
    image: "",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [previewImage, setPreviewImage] = useState("")

  // Get authors and categories for dropdown
  const [authors, setAuthors] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Get author list
        const authorsResponse = await axios.get("http://localhost:9999/authors")
        setAuthors(authorsResponse.data)

        // Get category list
        const categoriesResponse = await axios.get("http://localhost:9999/categories")
        setCategories(categoriesResponse.data)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load authors and categories. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "stock" || name === "pages" || name === "publicationYear" ? parseInt(value) || 0 : value,
    }))
    
    // Update image preview when image URL changes
    if (name === "image") {
      setPreviewImage(value)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post("http://localhost:9999/books/create", formData)
      toast.success("Book created successfully!", {
        position: "top-right",
        autoClose: 3000,
      })
      setTimeout(() => navigate(`/book/${response.data._id}`), 3000)
    } catch (error) {
      console.error("Error creating book:", error)
      const errorMessage = error.response?.data?.message || "Failed to create book. Please try again later."
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      })
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading...</p>
      </div>
    )
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
    )
  }

  return (
    <div className="container py-5">
      <ToastContainer />
      
      {/* Header with back button */}
      <div className="d-flex align-items-center mb-4">
        <button 
          className="btn btn-outline-primary me-3" 
          onClick={() => navigate("/")}
        >
          <i className="bi bi-arrow-left me-2"></i>Back to Library
        </button>
        <h1 className="mb-0">Add New Book</h1>
      </div>
      
      <div className="card shadow border-0 overflow-hidden">
        <div className="card-header bg-success text-white py-3">
          <h5 className="mb-0">Enter Book Information</h5>
        </div>
        
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* Left column - Book details */}
              <div className="col-lg-8">
                <div className="row g-3">
                  {/* Title */}
                  <div className="col-md-12">
                    <label htmlFor="title" className="form-label fw-bold">
                      Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter book title"
                      required
                    />
                  </div>

                  {/* Author & Category */}
                  <div className="col-md-6">
                    <label htmlFor="author" className="form-label fw-bold">
                      Author <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="author"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Author</option>
                      {authors.map((author) => (
                        <option key={author._id} value={author._id}>
                          {author.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="category" className="form-label fw-bold">
                      Category <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ISBN & Publication Year */}
                  <div className="col-md-6">
                    <label htmlFor="isbn" className="form-label fw-bold">
                      ISBN <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="isbn"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleChange}
                      placeholder="e.g., 978-3-16-148410-0"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="publicationYear" className="form-label fw-bold">
                      Publication Year <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="publicationYear"
                      name="publicationYear"
                      value={formData.publicationYear}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Publisher & Pages */}
                  <div className="col-md-6">
                    <label htmlFor="publisher" className="form-label fw-bold">
                      Publisher <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="publisher"
                      name="publisher"
                      value={formData.publisher}
                      onChange={handleChange}
                      placeholder="Publisher name"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="pages" className="form-label fw-bold">
                      Pages <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="pages"
                      name="pages"
                      value={formData.pages}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Stock */}
                  <div className="col-md-6">
                    <label htmlFor="stock" className="form-label fw-bold">
                      Stock
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">Qty</span>
                      <input
                        type="number"
                        className="form-control"
                        id="stock"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="col-md-12 mt-3">
                    <label htmlFor="description" className="form-label fw-bold">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="5"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter a detailed description of the book"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              {/* Right column - Image preview */}
              <div className="col-lg-4">
                <div className="card h-100 bg-light">
                  <div className="card-header">
                    <h5 className="mb-0">Book Cover</h5>
                  </div>
                  <div className="card-body d-flex flex-column">
                    <div className="flex-grow-1 d-flex align-items-center justify-content-center mb-3">
                      {previewImage ? (
                        <img 
                          src={previewImage || "/placeholder.svg"} 
                          alt="Book cover preview" 
                          className="img-fluid rounded shadow-sm" 
                          style={{ maxHeight: "250px" }}
                        />
                      ) : (
                        <div className="text-center p-5 border rounded bg-white">
                          <i className="bi bi-book" style={{ fontSize: "3rem" }}></i>
                          <p className="mt-2 text-muted">No image available</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="image" className="form-label fw-bold">
                        Image URL
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="Enter image URL"
                      />
                      <small className="text-muted d-block mt-2">
                        Enter a valid URL for the book cover image
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/")}>
                Cancel
              </button>
              <button type="submit" className="btn btn-success px-4">
                <i className="bi bi-plus-circle me-2"></i>Add Book
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateBook
