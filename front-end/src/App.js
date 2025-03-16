import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage";
import BookDetails from "./BookDetails";
import EditBook from "./EditBook";
import CreateBook from "./CreateBook";

const App=()=> {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book/:id" element={<BookDetails />} />
        <Route path="/edit-book/:id" element={<EditBook />} />
        <Route path="/create-book" element={<CreateBook />} />
      </Routes>
    </Router>
  );
}
export default App;