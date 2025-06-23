-- Example Queries for Summit Hikes Database
-- Common filtering and sorting operations for the web app

-- 1. Find all easy hikes (difficulty <= 3)
SELECT * FROM hikes_with_peaks
WHERE difficulty_rating <= 3
ORDER BY difficulty_rating, round_trip_miles;

-- 2. Find all fourteeners
SELECT * FROM fourteeners
ORDER BY highest_peak_elevation DESC;

-- 3. Find hikes by class (e.g., class 1 and 2 only)
SELECT * FROM hikes
WHERE class_numeric <= 2
ORDER BY class_numeric, difficulty_rating;

-- 4. Find short hikes (< 5 miles)
SELECT * FROM hikes_with_peaks
WHERE round_trip_miles < 5
ORDER BY round_trip_miles;

-- 5. Find hikes with low crowds
SELECT * FROM hikes
WHERE crowd_level_numeric <= 2
ORDER BY name;

-- 6. Find overnight-suitable hikes
SELECT * FROM hikes_with_peaks
WHERE is_overnight = TRUE
ORDER BY difficulty_rating;

-- 7. Find hikes by elevation gain range
SELECT * FROM hikes
WHERE total_elevation_gain BETWEEN 2000 AND 3000
ORDER BY total_elevation_gain;

-- 8. Find hikes climbable in specific month (e.g., May)
SELECT DISTINCT h.*, cs.season_text
FROM hikes h
JOIN climbing_seasons cs ON h.id = cs.hike_id
WHERE 5 BETWEEN cs.start_month AND cs.end_month
ORDER BY h.difficulty_rating;

-- 9. Search hikes by name or description
SELECT * FROM hikes
WHERE name LIKE '%Peak%' 
   OR description LIKE '%glacier%'
ORDER BY name;

-- 10. Find hikes within hiking time range
SELECT * FROM hikes
WHERE hiking_time_max <= 6  -- Can complete in 6 hours or less
ORDER BY hiking_time_max;

-- 11. Complex filter: Easy fourteeners with low crowds
SELECT h.*, p.elevation as peak_elevation
FROM hikes h
JOIN peaks p ON h.id = p.hike_id
WHERE p.elevation >= 14000
  AND h.difficulty_rating <= 5
  AND h.crowd_level_numeric <= 3
ORDER BY h.difficulty_rating;

-- 12. Get all hikes with multiple peaks
SELECT * FROM hikes_with_peaks
WHERE peak_count > 1
ORDER BY peak_count DESC, difficulty_rating;

-- 13. Find hikes by starting elevation (for acclimatization)
SELECT * FROM hikes
WHERE start_elevation >= 10000
ORDER BY start_elevation DESC;

-- 14. Statistical summary
SELECT 
    COUNT(*) as total_hikes,
    COUNT(CASE WHEN highest_peak_elevation >= 14000 THEN 1 END) as fourteeners,
    AVG(round_trip_miles) as avg_distance,
    AVG(total_elevation_gain) as avg_elevation_gain,
    AVG(difficulty_rating) as avg_difficulty,
    MIN(round_trip_miles) as shortest_hike,
    MAX(round_trip_miles) as longest_hike
FROM hikes_with_peaks;

-- 15. Hikes grouped by difficulty level
SELECT 
    difficulty_label,
    COUNT(*) as hike_count,
    AVG(round_trip_miles) as avg_miles,
    AVG(total_elevation_gain) as avg_gain
FROM hikes
GROUP BY difficulty_label
ORDER BY difficulty_rating;

-- API-friendly queries with pagination
-- 16. Paginated results with filters
SELECT * FROM hikes
WHERE difficulty_rating <= :max_difficulty
  AND round_trip_miles <= :max_distance
  AND crowd_level_numeric <= :max_crowd_level
ORDER BY :sort_column :sort_direction
LIMIT :page_size OFFSET :offset;

-- 17. Get single hike with all related data
SELECT 
    h.*,
    GROUP_CONCAT(
        json_object('name', p.peak_name, 'elevation', p.elevation)
    ) as peaks_json,
    t.latitude, t.longitude,
    cs.season_text
FROM hikes h
LEFT JOIN peaks p ON h.id = p.hike_id
LEFT JOIN trailheads t ON h.id = t.hike_id
LEFT JOIN climbing_seasons cs ON h.id = cs.hike_id
WHERE h.id = :hike_id
GROUP BY h.id;