// Small helper functions used in many places.

// 249 -> "₹249.00"
export function formatPrice(amount) {
  return "₹" + Number(amount).toFixed(2);
}

// Turns any Axios error into one readable sentence.
export function getErrorMessage(error) {
  if (error.response) {
    const detail = error.response.data?.detail;
    if (typeof detail === "string") return detail;
    return "Something went wrong. Please try again.";
  }
  if (error.request) {
    return "Cannot reach the server. Please check that the backend is running.";
  }
  return "Something went wrong. Please try again.";
}

// These numbers are ONLY for showing a preview in the cart.
// The real total is always calculated again by the backend using database prices.
const TAX_PERCENT = 5;
const DELIVERY_CHARGE = 40;
const FREE_DELIVERY_ABOVE = 500;

export function calculatePreview(subtotal, orderType) {
  const tax = Math.round(subtotal * TAX_PERCENT) / 100;
  let delivery = 0;
  if (orderType === "Delivery" && subtotal > 0 && subtotal < FREE_DELIVERY_ABOVE) {
    delivery = DELIVERY_CHARGE;
  }
  const total = subtotal + tax + delivery;
  return { tax, delivery, total };
}

// Nice date like "09 Oct 2026, 11:05 am"
export function formatDate(isoString) {
  return new Date(isoString).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Statuses after which an order can no longer change
export const FINAL_STATUSES = ["Delivered", "Completed", "Served", "Cancelled", "Rejected"];
