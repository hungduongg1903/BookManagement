"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "bootstrap/dist/css/bootstrap.min.css"

const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await axios.post("http://localhost:9999/users/login", {
        username,
        password,
      })

      if (response.status === 200) {
        const { token, user } = response.data
        // Store token, userId, and role in localStorage
        localStorage.setItem("token", token)
        localStorage.setItem("userId", user._id)
        localStorage.setItem("role", user.role)
        toast.success("Login successful!")

        // Redirect based on role
        const redirectPath = user.role === "admin" ? "/" : "/user-home"
        setTimeout(() => navigate(redirectPath), 2000)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed. Please try again."
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
              className="card-header bg-gradient-primary text-white text-center py-4"
              style={{ background: "linear-gradient(to right, #28a745, #20c997)" }}
            >
              <h3 className="mb-0 fw-bold">Welcome Back</h3>
              <p className="text-white-50 mb-0">Sign in to your account</p>
            </div>

            <div className="card-body p-4 p-md-5">
              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
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
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <label htmlFor="password" className="form-label fw-medium">
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-decoration-none small">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control py-2"
                      id="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-check mb-4">
                  <input className="form-check-input" type="checkbox" id="rememberMe" />
                  <label className="form-check-label small" htmlFor="rememberMe">
                    Remember me
                  </label>
                </div>

                <button type="submit" className="btn btn-success w-100 py-2 fw-medium" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="mb-0">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-success fw-medium">
                    Register here
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

export default function StyledLogin() {
  return (
    <>
      <style>{styles}</style>
      <Login />
    </>
  )
}

