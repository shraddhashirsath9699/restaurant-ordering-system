import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FoodCard from "../components/FoodCard";
import { EmptyState, ErrorBox, Loading } from "../components/StateMessages";
import { getCategories, getMenu } from "../services/api";
import { getErrorMessage } from "../utils/helpers";

function Menu() {
  const [searchParams] = useSearchParams();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchText, setSearchText] = useState("");
  // category id from the address (?category=2) or "all"
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [menuResponse, categoryResponse] = await Promise.all([getMenu(), getCategories()]);
      setFoods(menuResponse.data);
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

  // Search + category filter (done in the browser, so it is instant)
  const visibleFoods = foods.filter((food) => {
    const matchesCategory = selectedCategory === "all" || String(food.category_id) === String(selectedCategory);
    const matchesSearch = food.name.toLowerCase().includes(searchText.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function clearFilters() {
    setSearchText("");
    setSelectedCategory("all");
  }

  return (
    <div className="container page-section">
      <h1 className="center-text">Our Menu</h1>
      <p className="center-text muted">Freshly prepared. Add your favourites to the cart.</p>

      <div className="menu-controls">
        <input
          type="search"
          placeholder="Search dishes..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          aria-label="Search dishes"
        />
        <div className="chip-row">
          <button className={`chip ${selectedCategory === "all" ? "active" : ""}`} onClick={() => setSelectedCategory("all")}>
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`chip ${String(selectedCategory) === String(category.id) ? "active" : ""}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {loading && <Loading text="Loading menu..." />}
      {error && <ErrorBox message={error} onRetry={loadData} />}

      {!loading && !error && foods.length === 0 && <EmptyState title="The menu is empty" text="Please check back soon." />}

      {!loading && !error && foods.length > 0 && visibleFoods.length === 0 && (
        <EmptyState title="No dishes found" text="Try a different search or category.">
          <button className="btn btn-gold" onClick={clearFilters}>Clear filters</button>
        </EmptyState>
      )}

      <div className="food-grid">
        {visibleFoods.map((food) => (
          <FoodCard key={food.id} food={food} />
        ))}
      </div>
    </div>
  );
}

export default Menu;
