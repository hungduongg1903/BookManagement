"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "bootstrap/dist/css/bootstrap.min.css"

const Register = () => {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      toast.error("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post("http://localhost:9999/users/register", {
        username,
        email,
        password
      })

      if (response.status === 201) {
        toast.success("Registration successful! Please login.")
        setTimeout(() => navigate("/login"), 2000)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <ToastContainer />
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-lg border-0 rounded-lg">
            <div
              className="card-header text-white text-center py-4"
              style={{ background: "linear-gradient(to right, #28a745, #20c997)" }}
            >
              <h3 className="mb-0 fw-bold">Create Account</h3>
              <p className="text-white-50 mb-0">Join our library community</p>
            </div>

            <div className="card-body p-4 p-md-5">
              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label fw-medium">
                    Username
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control py-2"
                      id="username"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-medium">
                    Email
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control py-2"
                      id="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label fw-medium">
                    Password
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control py-2"
                      id="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-text">Password should be at least 6 characters</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label fw-medium">
                    Confirm Password
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-lock-fill"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control py-2"
                      id="confirmPassword"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-success w-100 py-2 fw-medium" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="mb-0">
                  Already have an account?{" "}
                  <Link to="/login" className="text-success fw-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-4 text-muted small">
            <p>© 2024 Library Management System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add Bootstrap Icons CSS
const styles = `
  @import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css");
`

export default function StyledRegister() {
  return (
    <>
      <style>{styles}</style>
      <Register />
    </>
  )
}

