import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const ManagerCategory = () => {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newName, setNewName] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    axios
      .get("http://localhost:9999/categories", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCategories(res.data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, [token, navigate]);

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:9999/categories/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() =>
        setCategories(categories.filter((category) => category._id !== id))
      )
      .catch((error) => console.error("Error deleting category:", error));
  };

  const handleUpdate = (id) => {
    axios
      .put(
        `http://localhost:9999/categories/update/${id}`,
        { name: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setCategories(
          categories.map((category) =>
            category._id === id ? { ...category, name: newName } : category
          )
        );
        setEditingCategory(null);
        setNewName("");
      })
      .catch((error) => console.error("Error updating category:", error));
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Manage Categories</h2>
      <table className="table table-bordered table-hover">
        <thead className="table-primary">
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category._id}>
              <td>
                {editingCategory === category._id ? (
                  <input
                    type="text"
                    className="form-control"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                ) : (
                  category.name
                )}
              </td>
              <td>
                {editingCategory === category._id ? (
                  <>
                    <button
                      className="btn btn-success me-2"
                      onClick={() => handleUpdate(category._id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setEditingCategory(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-warning me-2"
                      onClick={() => {
                        setEditingCategory(category._id);
                        setNewName(category.name);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(category._id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="btn btn-primary"
        onClick={() => navigate("/add-category")}
      >
        Add New Category
      </button>
    </div>
  );
};

export default ManagerCategory;
