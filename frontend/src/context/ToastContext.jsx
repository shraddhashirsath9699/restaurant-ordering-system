// Small pop-up messages ("toasts") like "Added to cart".
import { createContext, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // type is "success" or "error"
  function showToast(message, type = "success") {
    const id = Date.now() + Math.random();
    setToasts((old) => [...old, { id, message, type }]);
    // remove it after 3 seconds
    setTimeout(() => {
      setToasts((old) => old.filter((toast) => toast.id !== id));
    }, 3000);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
