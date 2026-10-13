import { useEffect, useState } from "react";
import { EmptyState, ErrorBox, Loading } from "../../components/StateMessages";
import { useToast } from "../../context/ToastContext";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../../services/api";
import { getErrorMessage } from "../../utils/helpers";

function AdminCategories() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null); // null = we are adding a new one
  const [formError, setFormError] = useState("");

  async function loadCategories() {
    setLoading(true);
    setError("");
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function resetForm() {
    setName("");
    setDescription("");
    setEditingId(null);
    setFormError("");
  }

  function startEdit(category) {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || "");
    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    if (name.trim().length < 2) {
      setFormError("Category name must be at least 2 letters");
      return;
    }
    try {
      const data = { name: name.trim(), description: description.trim() || null };
      if (editingId) {
        await updateCategory(editingId, data);
        showToast("Category updated");
      } else {
        await createCategory(data);
        showToast("Category added");
      }
      resetForm();
      loadCategories();
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  }

  async function handleDelete(category) {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    try {
      await deleteCategory(category.id);
      showToast("Category deleted");
      loadCategories();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  }

  return (
    <div>
      <h1>Categories</h1>

      <form className="form-card inline-form" onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit category" : "Add category"}</h3>
        <label className="field"><span>Name *</span><input value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="field"><span>Description</span><input value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        {formError && <div className="alert alert-error" role="alert">{formError}</div>}
        <div className="button-row">
          <button className="btn btn-gold">{editingId ? "Save changes" : "Add category"}</button>
          {editingId && <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      {loading && <Loading text="Loading categories..." />}
      {error && <ErrorBox message={error} onRetry={loadCategories} />}
      {!loading && !error && categories.length === 0 && <EmptyState title="No categories yet" text="Add your first category above." />}

      {!loading && !error && categories.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Description</th><th></th></tr></thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.description}</td>
                  <td className="actions">
                    <button className="btn btn-outline btn-small" onClick={() => startEdit(category)}>Edit</button>
                    <button className="btn btn-danger btn-small" onClick={() => handleDelete(category)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminCategories;
