import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layout Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Auth Components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// Book Components
import HomePage from "./HomePage";
import BookDetails from "./BookDetails";
import EditBook from "./EditBook";
import CreateBook from "./CreateBook";

// Loan Components
import UserLoans from "./components/loans/UserLoans";
import ExtendLoan from "./components/loans/ExtendLoan";
import LoanDetails from "./components/loans/LoanDetails";
import CreateLoan from "./components/loans/CreateLoan";
import AdminLoansList from "./components/loans/AdminLoansList";

// User Management Components
import AdminUsersList from "./components/users/AdminUsersList";
import UserForm from "./components/users/UserForm";

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, currentUser, loading } = useAuth();

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && currentUser.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Login />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/book/:id" element={<BookDetails />} />

              {/* Protected Book Routes */}
              <Route
                path="/edit-book/:id"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <EditBook />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-book"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <CreateBook />
                  </ProtectedRoute>
                }
              />

              {/* Protected User Routes */}
              <Route
                path="/loans"
                element={
                  <ProtectedRoute>
                    <UserLoans />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/loans/:id"
                element={
                  <ProtectedRoute>
                    <LoanDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/loans/:id/extend"
                element={
                  <ProtectedRoute>
                    <ExtendLoan />
                  </ProtectedRoute>
                }
              />

              {/* Route trực tiếp đến trang tạo phiếu mượn - chỉ dành cho admin */}
              <Route
                path="/create-loan"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <CreateLoan />
                  </ProtectedRoute>
                }
              />

              {/* Admin Loan Management Routes */}
              <Route
                path="/admin/loans"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminLoansList />
                  </ProtectedRoute>
                }
              />

              {/* Admin User Management Routes */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminUsersList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/create"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <UserForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/edit/:id"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <UserForm />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
