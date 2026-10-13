import { Link, useNavigate } from "react-router-dom";
import SafeImage from "../components/SafeImage";
import { EmptyState } from "../components/StateMessages";
import { useCart } from "../context/CartContext";
import { calculatePreview, formatPrice } from "../utils/helpers";

function Cart() {
  const { items, subtotal, increaseQuantity, decreaseQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const { tax, total } = calculatePreview(subtotal, "Takeaway"); // delivery charge is added at checkout

  if (items.length === 0) {
    return (
      <div className="container page-section">
        <EmptyState title="Your cart is empty" text="Add some delicious food from our menu.">
          <Link to="/menu" className="btn btn-gold">Browse Menu</Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container page-section">
      <h1>Your Cart</h1>
      <div className="cart-layout">
        <div className="cart-list">
          {items.map((item) => (
            <div className="cart-row" key={item.id}>
              <SafeImage src={item.image_url} alt={item.name} className="cart-image" />
              <div className="cart-info">
                <h3>{item.name}</h3>
                <p className="muted">{formatPrice(item.price)} each</p>
                <button className="link-button" onClick={() => removeItem(item.id)}>Remove</button>
              </div>
              <div className="qty-control">
                <button onClick={() => decreaseQuantity(item.id)} aria-label={`Decrease ${item.name}`}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => increaseQuantity(item.id)} aria-label={`Increase ${item.name}`}>+</button>
              </div>
              <strong className="cart-line-total">{formatPrice(item.price * item.quantity)}</strong>
            </div>
          ))}
          <button className="btn btn-outline btn-small" onClick={clearCart}>Clear cart</button>
        </div>

        <aside className="summary-card">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="summary-row"><span>Tax (5%)</span><span>{formatPrice(tax)}</span></div>
          <div className="summary-row"><span>Delivery</span><span>Added at checkout</span></div>
          <div className="summary-row summary-total"><span>Estimated total</span><span>{formatPrice(total)}</span></div>
          <p className="muted small">Final prices are confirmed by our server when you place the order.</p>
          <button className="btn btn-gold btn-large btn-full" onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </div>
  );
}

export default Cart;
