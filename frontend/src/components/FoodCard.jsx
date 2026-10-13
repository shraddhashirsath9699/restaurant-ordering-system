// One food item card. Used on the Home page and the Menu page.
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { formatPrice } from "../utils/helpers";
import SafeImage from "./SafeImage";

function FoodCard({ food }) {
  const { addToCart, getQuantity, increaseQuantity, decreaseQuantity } = useCart();
  const { showToast } = useToast();
  const quantity = getQuantity(food.id);

  function handleAdd() {
    addToCart(food);
    showToast(`${food.name} added to cart`);
  }

  return (
    <article className={`food-card ${food.is_available ? "" : "food-unavailable"}`}>
      <div className="food-image-wrap">
        <SafeImage src={food.image_url} alt={`${food.name} - ${food.category_name}`} className="food-image" />
        {/* Green square = veg, red square = non-veg */}
        <span className={`veg-mark ${food.is_veg ? "veg" : "nonveg"}`} title={food.is_veg ? "Vegetarian" : "Non-vegetarian"}>
          <span />
        </span>
        {!food.is_available && <span className="sold-out-badge">Currently unavailable</span>}
      </div>

      <div className="food-body">
        <p className="food-category">{food.category_name}</p>
        <h3>{food.name}</h3>
        <p className="food-desc">{food.description}</p>

        <div className="food-footer">
          <span className="food-price">{formatPrice(food.price)}</span>

          {!food.is_available ? (
            <button className="btn btn-disabled" disabled>
              Unavailable
            </button>
          ) : quantity === 0 ? (
            <button className="btn btn-gold btn-small" onClick={handleAdd}>
              Add to Cart
            </button>
          ) : (
            <div className="qty-control">
              <button onClick={() => decreaseQuantity(food.id)} aria-label={`Decrease ${food.name}`}>
                −
              </button>
              <span>{quantity}</span>
              <button onClick={() => increaseQuantity(food.id)} aria-label={`Increase ${food.name}`}>
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default FoodCard;
