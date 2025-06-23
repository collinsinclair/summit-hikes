import './LoadingSpinner.css';

function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading hikes...</p>
    </div>
  );
}

export default LoadingSpinner;