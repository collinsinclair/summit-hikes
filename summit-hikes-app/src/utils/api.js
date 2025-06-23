// Simple API utility for fetching hike data
// Keeping it straightforward - just fetch with error handling

const API_BASE_URL = 'http://localhost:8000';

/**
 * Fetch all hikes with optional filtering
 * @param {Object} filters - Query parameters for filtering
 * @returns {Promise<Array>} Array of hike objects
 */
export async function fetchHikes(filters = {}) {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    // Add filters to query params if they exist
    if (filters.max_difficulty !== undefined) {
      queryParams.append('max_difficulty', filters.max_difficulty);
    }
    if (filters.min_difficulty !== undefined) {
      queryParams.append('min_difficulty', filters.min_difficulty);
    }
    if (filters.max_distance !== undefined) {
      queryParams.append('max_distance', filters.max_distance);
    }
    if (filters.min_distance !== undefined) {
      queryParams.append('min_distance', filters.min_distance);
    }
    if (filters.max_elevation_gain !== undefined) {
      queryParams.append('max_elevation_gain', filters.max_elevation_gain);
    }
    if (filters.min_elevation_gain !== undefined) {
      queryParams.append('min_elevation_gain', filters.min_elevation_gain);
    }
    if (filters.max_class !== undefined) {
      queryParams.append('max_class', filters.max_class);
    }
    if (filters.max_crowd !== undefined) {
      queryParams.append('max_crowd', filters.max_crowd);
    }
    if (filters.fourteeners_only) {
      queryParams.append('fourteeners_only', 'true');
    }
    if (filters.overnight_only) {
      queryParams.append('overnight_only', 'true');
    }
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    if (filters.sort_by) {
      queryParams.append('sort_by', filters.sort_by);
    }
    if (filters.sort_order) {
      queryParams.append('sort_order', filters.sort_order);
    }
    
    // Build full URL
    const url = `${API_BASE_URL}/hikes${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    // Fetch data
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch hikes: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error fetching hikes:', error);
    throw error;
  }
}

/**
 * Fetch detailed information for a single hike
 * @param {number} hikeId - The ID of the hike to fetch
 * @returns {Promise<Object>} Detailed hike object
 */
export async function fetchHikeDetails(hikeId) {
  try {
    const response = await fetch(`${API_BASE_URL}/hikes/${hikeId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch hike details: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error fetching hike details:', error);
    throw error;
  }
}

/**
 * Fetch database statistics
 * @returns {Promise<Object>} Statistics object
 */
export async function fetchStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}