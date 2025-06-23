# Data Transformation Guide

## Field Mappings and Transformations

### Difficulty
- Extract numeric value from "X/10" format
- Examples: "4/10" → 4.0, "4.5/10" → 4.5

### Class
- Map to numeric values for sorting:
  - "1" → 1.0
  - "1; 2 for the last 0.5 mile" → 1.5
  - "2" → 2.0
  - "2+" → 2.3
  - "2+/3" → 2.5
  - "2/2+" → 2.2
  - "3" → 3.0
  - "3/3+" → 3.3
  - "3; class 2 hike in" → 3.0

### Crowd Level
- Simplified numeric mapping:
  - "Hermit" → 1
  - "Low" → 2
  - "Low to moderate" → 3
  - "Moderate", "Medium" → 4
  - "High" → 5
  - Complex descriptions → parse primary level

### Distance
- Extract numeric value from "X miles" format
- Example: "7.28 miles" → 7.28

### Hiking Time
- Parse range into min/max hours
- Examples:
  - "4.5-6 hours" → min: 4.5, max: 6.0
  - "7-10 hours" → min: 7.0, max: 10.0

### Elevations
- Remove commas and convert to integers
- Extract from text with feet marker (')
- Examples:
  - "10,300'" → 10300
  - "2,950'" → 2950

### GPS Coordinates
- Parse from degree-minute format to decimal
- Formula: degrees + (minutes / 60)
- Example: "39°49.681' N" → 39.828017

### Climbing Seasons
- Parse month ranges from text
- Map month names to numbers
- Handle "Year-round" as 1-12
- Examples:
  - "June-September" → start: 6, end: 9
  - "Early June-September" → start: 6, end: 9

### Multi-Peak Handling
- Check for "peak_elevations" field
- Parse multiple peaks from formatted text
- Create separate peak records for each

### Special Fields
- "GOOD OVERNIGHT" label → is_overnight = true
- Missing fields → NULL
- Bonus peaks → separate table entries