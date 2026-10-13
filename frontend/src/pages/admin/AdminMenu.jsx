import { useEffect, useState } from "react";
import SafeImage from "../../components/SafeImage";
import { EmptyState, ErrorBox, Loading } from "../../components/StateMessages";
import { useToast } from "../../context/ToastContext";
import { createMenuItem, deleteMenuItem, getCategories, getMenu, updateMenuItem } from "../../services/api";
import { formatPrice, getErrorMessage } from "../../utils/helpers";

const EMPTY_FORM = {
  name: "",
  category_id: "",
  price: "",
  description: "",
  image_url: "",
  is_veg: true,
  is_available: true,
  is_popular: false,
};

function AdminMenu() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [menuResponse, categoryResponse] = await Promise.all([getMenu(), getCategories()]);
      setItems(menuResponse.data);
      setCategories(categoryResponse.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Works for text boxes and for checkboxes
  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  function openAddForm() {
    setForm({ ...EMPTY_FORM, category_id: categories[0]?.id || "" });
    setEditingId(null);
    setFormError("");
    setShowForm(true);
  }

  function openEditForm(item) {
    setForm({
      name: item.name,
      category_id: item.category_id,
      price: item.price,
      description: item.description || "",
      image_url: item.image_url || "",
      is_veg: item.is_veg,
      is_available: item.is_available,
      is_popular: item.is_popular,
    });
    setEditingId(item.id);
    setFormError("");
    setShowForm(true);
    window.scrollTo(0, 0);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (form.name.trim().length < 2) return setFormError("Name must be at least 2 letters");
    if (!form.category_id) return setFormError("Please choose a category");
    if (!(Number(form.price) > 0)) return setFormError("Price must be greater than 0");

    const data = {
      name: form.name.trim(),
      category_id: Number(form.category_id),
      price: Number(form.price),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      is_veg: form.is_veg,
      is_available: form.is_available,
      is_popular: form.is_popular,
    };

    try {
      if (editingId) {
        await updateMenuItem(editingId, data);
        showToast("Menu item updated");
      } else {
        await createMenuItem(data);
        showToast("Menu item added");
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  }

  // Switch available / unavailable quickly from the table
  async function toggleAvailability(item) {
    try {
      await updateMenuItem(item.id, {
        category_id: item.category_id,
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image_url,
        is_veg: item.is_veg,
        is_popular: item.is_popular,
        is_available: !item.is_available,
      });
      showToast(item.is_available ? "Item disabled" : "Item enabled");
      loadData();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await deleteMenuItem(item.id);
      showToast("Menu item deleted");
      loadData();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  }

  return (
    <div>
      <div className="order-head">
        <h1>Menu Items</h1>
        <button className="btn btn-gold" onClick={openAddForm} disabled={categories.length === 0}>+ Add item</button>
      </div>
      {!loading && categories.length === 0 && <p className="muted">Create a category first, then you can add food items.</p>}

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editingId ? "Edit menu item" : "Add menu item"}</h3>
          <div className="form-grid">
            <label className="field"><span>Name *</span><input name="name" value={form.name} onChange={handleChange} /></label>
            <label className="field">
              <span>Category *</span>
              <select name="category_id" value={form.category_id} onChange={handleChange}>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="field"><span>Price (₹) *</span><input name="price" type="number" min="1" step="0.01" value={form.price} onChange={handleChange} /></label>
            <label className="field"><span>Image URL</span><input name="image_url" value={form.image_url} onChange={handleChange} placeholder="https://..." /></label>
          </div>
          <label className="field"><span>Description</span><textarea name="description" rows="3" value={form.description} onChange={handleChange} /></label>

          {form.image_url && <SafeImage src={form.image_url} alt="Preview of the food" className="image-preview" />}

          <div className="check-row">
            <label><input type="checkbox" name="is_veg" checked={form.is_veg} onChange={handleChange} /> Vegetarian</label>
            <label><input type="checkbox" name="is_available" checked={form.is_available} onChange={handleChange} /> Available</label>
            <label><input type="checkbox" name="is_popular" checked={form.is_popular} onChange={handleChange} /> Signature dish</label>
          </div>

          {formError && <div className="alert alert-error" role="alert">{formError}</div>}
          <div className="button-row">
            <button className="btn btn-gold">{editingId ? "Save changes" : "Add item"}</button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {loading && <Loading text="Loading menu..." />}
      {error && <ErrorBox message={error} onRetry={loadData} />}
      {!loading && !error && items.length === 0 && <EmptyState title="No menu items" text="Add your first dish." />}

      {!loading && !error && items.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td><SafeImage src={item.image_url} alt={item.name} className="table-image" /></td>
                  <td>{item.name} {item.is_veg ? "🟢" : "🔴"}</td>
                  <td>{item.category_name}</td>
                  <td>{formatPrice(item.price)}</td>
                  <td>
                    <span className={`status-badge ${item.is_available ? "" : "off"}`}>{item.is_available ? "Available" : "Disabled"}</span>
                  </td>
                  <td className="actions">
                    <button className="btn btn-outline btn-small" onClick={() => openEditForm(item)}>Edit</button>
                    <button className="btn btn-outline btn-small" onClick={() => toggleAvailability(item)}>{item.is_available ? "Disable" : "Enable"}</button>
                    <button className="btn btn-danger btn-small" onClick={() => handleDelete(item)}>Delete</button>
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

export default AdminMenu;
