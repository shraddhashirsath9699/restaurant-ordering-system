// Shows the order steps as a progress bar. Done steps are gold.
function OrderStatusTracker({ steps, currentStatus }) {
  // Cancelled / rejected orders are not part of the normal steps
  if (currentStatus === "Cancelled" || currentStatus === "Rejected") {
    return <p className="status-cancelled">This order was {currentStatus.toLowerCase()}.</p>;
  }

  const currentIndex = steps.indexOf(currentStatus);

  return (
    <ol className="tracker">
      {steps.map((step, index) => {
        let stepClass = "tracker-step";
        if (index < currentIndex) stepClass += " done";
        if (index === currentIndex) stepClass += " current";
        return (
          <li key={step} className={stepClass}>
            <span className="tracker-dot">{index < currentIndex ? "✓" : index + 1}</span>
            <span className="tracker-label">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default OrderStatusTracker;
