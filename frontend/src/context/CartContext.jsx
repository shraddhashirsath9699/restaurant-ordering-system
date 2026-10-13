// Cart state shared by the whole app. The cart is saved in localStorage so a refresh keeps it.
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

function loadSavedCart() {
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadSavedCart);

  // Save to localStorage whenever the cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  // Add a food item (or +1 if it is already in the cart)
  function addToCart(food) {
    setItems((oldItems) => {
      const found = oldItems.find((item) => item.id === food.id);
      if (found) {
        return oldItems.map((item) => (item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...oldItems, { id: food.id, name: food.name, price: food.price, image_url: food.image_url, is_veg: food.is_veg, quantity: 1 }];
    });
  }

  function increaseQuantity(id) {
    setItems((oldItems) =>
      oldItems.map((item) => (item.id === id && item.quantity < 20 ? { ...item, quantity: item.quantity + 1 } : item))
    );
  }

  // Decrease by 1. If it becomes 0, remove the item.
  function decreaseQuantity(id) {
    setItems((oldItems) =>
      oldItems
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(id) {
    setItems((oldItems) => oldItems.filter((item) => item.id !== id));
  }

  function clearCart() {
    setItems([]);
  }

  function getQuantity(id) {
    const found = items.find((item) => item.id === id);
    return found ? found.quantity : 0;
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value = { items, itemCount, subtotal, addToCart, increaseQuantity, decreaseQuantity, removeItem, clearCart, getQuantity };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
