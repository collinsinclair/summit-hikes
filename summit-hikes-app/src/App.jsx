import { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import FilterControls from './components/FilterControls';
import HikesDisplay from './components/HikesDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import VisualizationPage from './components/VisualizationPage';
// import { mockHikes } from './utils/mockData';

function App() {
  // State for all hikes data
  const [allHikes, setAllHikes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyRange, setDifficultyRange] = useState({ min: 1, max: 10 });
  const [distanceRange, setDistanceRange] = useState({ min: 0, max: 25 });
  const [elevationGainRange, setElevationGainRange] = useState({ min: 0, max: 10000 });
  const [hikeTimeRange, setHikeTimeRange] = useState({ min: 0, max: 24 });
  const [distanceFromDenverRange, setDistanceFromDenverRange] = useState({ min: 0, max: 250 });
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [maxCrowdLevel, setMaxCrowdLevel] = useState(5);
  const [showFourteenersOnly, setShowFourteenersOnly] = useState(false);
  const [showOvernightOnly, setShowOvernightOnly] = useState(false);
  const [showInSeasonOnly, setShowInSeasonOnly] = useState(false);

  // State for sorting
  const [sortBy, setSortBy] = useState('number');
  const [sortOrder, setSortOrder] = useState('asc');

  // State for page navigation
  const [currentPage, setCurrentPage] = useState('hikes');

  // Load data on component mount
  useEffect(() => {
    loadHikes();
  }, []);

  // Function to load hikes from API
  const loadHikes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/hikes');
      if (!response.ok) {
        throw new Error('Failed to fetch hikes');
      }
      const data = await response.json();
      setAllHikes(data);
    } catch (err) {
      setError('Failed to load hikes. Please try again.');
      console.error('Error loading hikes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter hikes based on all criteria
  const getFilteredHikes = () => {
    return allHikes.filter(hike => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          hike.name.toLowerCase().includes(searchLower) ||
          hike.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Difficulty filter
      if (hike.difficulty_rating < difficultyRange.min || 
          hike.difficulty_rating > difficultyRange.max) {
        return false;
      }

      // Distance filter
      if (hike.round_trip_miles < distanceRange.min || 
          hike.round_trip_miles > distanceRange.max) {
        return false;
      }

      // Elevation gain filter
      if (hike.total_elevation_gain < elevationGainRange.min || 
          hike.total_elevation_gain > elevationGainRange.max) {
        return false;
      }

      // Hike time filter
      if (hike.hiking_time_min > hikeTimeRange.max || 
          hike.hiking_time_max < hikeTimeRange.min) {
        return false;
      }

      // Class filter (if any classes are selected)
      if (selectedClasses.length > 0) {
        const hikeClass = Math.floor(hike.class_numeric);
        if (!selectedClasses.includes(hikeClass)) {
          return false;
        }
      }

      // Crowd level filter
      if (hike.crowd_level_numeric > maxCrowdLevel) {
        return false;
      }

      // Fourteeners filter
      if (showFourteenersOnly && hike.highest_peak_elevation < 14000) {
        return false;
      }

      // Overnight filter
      if (showOvernightOnly && !hike.is_overnight) {
        return false;
      }

      // In-season filter
      if (showInSeasonOnly && !hike.is_in_season) {
        return false;
      }

      // Distance from Denver filter
      if (hike.distance_from_denver) {
        if (hike.distance_from_denver < distanceFromDenverRange.min || 
            hike.distance_from_denver > distanceFromDenverRange.max) {
          return false;
        }
      }

      return true;
    });
  };

  // Sort filtered hikes
  const getSortedHikes = (filteredHikes) => {
    return [...filteredHikes].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle null/undefined values
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      // Compare values
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Get final processed hikes
  const filteredHikes = getFilteredHikes();
  const displayHikes = getSortedHikes(filteredHikes);

  // Handler functions for filter changes
  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
  };

  const handleDifficultyRangeChange = (newRange) => {
    setDifficultyRange(newRange);
  };

  const handleDistanceRangeChange = (newRange) => {
    setDistanceRange(newRange);
  };

  const handleElevationGainRangeChange = (newRange) => {
    setElevationGainRange(newRange);
  };

  const handleHikeTimeRangeChange = (newRange) => {
    setHikeTimeRange(newRange);
  };

  const handleDistanceFromDenverRangeChange = (newRange) => {
    setDistanceFromDenverRange(newRange);
  };

  const handleClassToggle = (classNumber) => {
    setSelectedClasses(prev => {
      if (prev.includes(classNumber)) {
        return prev.filter(c => c !== classNumber);
      } else {
        return [...prev, classNumber];
      }
    });
  };

  const handleCrowdLevelChange = (newLevel) => {
    setMaxCrowdLevel(newLevel);
  };

  const handleFourteenersToggle = () => {
    setShowFourteenersOnly(!showFourteenersOnly);
  };

  const handleOvernightToggle = () => {
    setShowOvernightOnly(!showOvernightOnly);
  };

  const handleInSeasonToggle = () => {
    setShowInSeasonOnly(!showInSeasonOnly);
  };

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      // Toggle sort order if clicking same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDifficultyRange({ min: 1, max: 10 });
    setDistanceRange({ min: 0, max: 25 });
    setElevationGainRange({ min: 0, max: 10000 });
    setHikeTimeRange({ min: 0, max: 24 });
    setDistanceFromDenverRange({ min: 0, max: 250 });
    setSelectedClasses([]);
    setMaxCrowdLevel(5);
    setShowFourteenersOnly(false);
    setShowOvernightOnly(false);
    setShowInSeasonOnly(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">Summit Hikes Explorer</h1>
          <nav className="app-nav">
            <button 
              className={`nav-button ${currentPage === 'hikes' ? 'active' : ''}`}
              onClick={() => setCurrentPage('hikes')}
            >
              Hikes
            </button>
            <button 
              className={`nav-button ${currentPage === 'visualizations' ? 'active' : ''}`}
              onClick={() => setCurrentPage('visualizations')}
            >
              Visualizations
            </button>
          </nav>
        </div>
      </header>

      <main className="container">
        {currentPage === 'hikes' ? (
          <>
            <SearchBar 
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
            />

            <div className="app-main">
              <aside className="app-sidebar">
                <FilterControls
                  difficultyRange={difficultyRange}
                  distanceRange={distanceRange}
                  elevationGainRange={elevationGainRange}
                  hikeTimeRange={hikeTimeRange}
                  distanceFromDenverRange={distanceFromDenverRange}
                  selectedClasses={selectedClasses}
                  maxCrowdLevel={maxCrowdLevel}
                  showFourteenersOnly={showFourteenersOnly}
                  showOvernightOnly={showOvernightOnly}
                  showInSeasonOnly={showInSeasonOnly}
                  onDifficultyRangeChange={handleDifficultyRangeChange}
                  onDistanceRangeChange={handleDistanceRangeChange}
                  onElevationGainRangeChange={handleElevationGainRangeChange}
                  onHikeTimeRangeChange={handleHikeTimeRangeChange}
                  onDistanceFromDenverRangeChange={handleDistanceFromDenverRangeChange}
                  onClassToggle={handleClassToggle}
                  onCrowdLevelChange={handleCrowdLevelChange}
                  onFourteenersToggle={handleFourteenersToggle}
                  onOvernightToggle={handleOvernightToggle}
                  onInSeasonToggle={handleInSeasonToggle}
                  onResetFilters={handleResetFilters}
                />
              </aside>

              <div className="app-content">
                {isLoading ? (
                  <LoadingSpinner />
                ) : error ? (
                  <div className="error-message">
                    <p>{error}</p>
                    <button onClick={loadHikes}>Try Again</button>
                  </div>
                ) : (
                  <HikesDisplay
                    hikes={displayHikes}
                    totalCount={allHikes.length}
                    filteredCount={filteredHikes.length}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <VisualizationPage allHikes={allHikes} />
        )}
      </main>
    </div>
  );
}

export default App;