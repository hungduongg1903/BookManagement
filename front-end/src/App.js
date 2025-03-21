import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage";
import BookDetails from "./BookDetails";
import EditBook from "./EditBook";
import CreateBook from "./CreateBook";
import Login from "./Login";
import Register from "./Register";
import UserHomePage from "./UserHomePage";

const App=()=> {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book/:id" element={<BookDetails />} />
        <Route path="/edit-book/:id" element={<EditBook />} />
        <Route path="/create-book" element={<CreateBook />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user-home" element={<UserHomePage />} />
      </Routes>
    </Router>
  );
}
export default App;