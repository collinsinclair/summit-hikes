import './SearchBar.css';

function SearchBar({ searchTerm, onSearchChange }) {
  const handleInputChange = (event) => {
    onSearchChange(event.target.value);
  };

  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search by hike name or description..."
        value={searchTerm}
        onChange={handleInputChange}
        className="search-input"
      />
      {searchTerm && (
        <button 
          onClick={handleClearSearch}
          className="search-clear"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default SearchBar;