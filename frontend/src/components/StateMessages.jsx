// Small components for the loading / empty / error states.
export function Loading({ text = "Loading..." }) {
  return (
    <div className="state-box">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  );
}

export function EmptyState({ title, text, children }) {
  return (
    <div className="state-box">
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="state-box error-box" role="alert">
      <h3>Oops!</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-gold" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
