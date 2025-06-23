import { useState, useEffect } from 'react';
import './VisualizationPage.css';

const VisualizationPage = ({ allHikes }) => {
  const [xAxis, setXAxis] = useState('difficulty_rating');
  const [yAxis, setYAxis] = useState('hiking_time_max');
  const [svgDimensions, setSvgDimensions] = useState({ width: 800, height: 600 });

  // Chart margins
  const margin = { top: 20, right: 20, bottom: 60, left: 80 };
  const chartWidth = svgDimensions.width - margin.left - margin.right;
  const chartHeight = svgDimensions.height - margin.top - margin.bottom;

  // Available data fields for axes
  const dataFields = [
    { key: 'difficulty_rating', label: 'Difficulty Rating', unit: '' },
    { key: 'round_trip_miles', label: 'Distance', unit: 'miles' },
    { key: 'total_elevation_gain', label: 'Elevation Gain', unit: 'ft' },
    { key: 'hiking_time_max', label: 'Max Hiking Time', unit: 'hours' },
    { key: 'hiking_time_min', label: 'Min Hiking Time', unit: 'hours' },
    { key: 'start_elevation', label: 'Start Elevation', unit: 'ft' },
    { key: 'class_numeric', label: 'Class', unit: '' },
    { key: 'crowd_level_numeric', label: 'Crowd Level', unit: '' },
    { key: 'highest_peak_elevation', label: 'Highest Peak Elevation', unit: 'ft' },
    { key: 'distance_from_denver', label: 'Distance from Denver', unit: 'miles' }
  ];

  // Filter out hikes with null values for selected axes
  const validHikes = allHikes.filter(hike => 
    hike[xAxis] != null && hike[yAxis] != null
  );

  // Calculate scales
  const getScale = (field, dimension) => {
    const values = validHikes.map(h => h[field]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const padding = range * 0.05; // 5% padding
    
    return {
      min: min - padding,
      max: max + padding,
      scale: (value) => {
        const normalized = (value - (min - padding)) / (range + 2 * padding);
        return dimension === 'x' ? normalized * chartWidth : chartHeight - (normalized * chartHeight);
      }
    };
  };

  const xScale = getScale(xAxis, 'x');
  const yScale = getScale(yAxis, 'y');

  // Generate axis ticks
  const generateTicks = (scale, axis) => {
    const ticks = [];
    const tickCount = 5;
    const step = (scale.max - scale.min) / tickCount;
    
    for (let i = 0; i <= tickCount; i++) {
      const value = scale.min + (step * i);
      const position = axis === 'x' ? scale.scale(value) : scale.scale(value);
      ticks.push({ value: Math.round(value * 100) / 100, position });
    }
    return ticks;
  };

  const xTicks = generateTicks(xScale, 'x');
  const yTicks = generateTicks(yScale, 'y');

  // Calculate linear regression with R-squared
  const calculateLinearRegression = (data, xKey, yKey) => {
    const n = data.length;
    if (n < 2) return null;

    const sumX = data.reduce((sum, d) => sum + d[xKey], 0);
    const sumY = data.reduce((sum, d) => sum + d[yKey], 0);
    const sumXY = data.reduce((sum, d) => sum + (d[xKey] * d[yKey]), 0);
    const sumXX = data.reduce((sum, d) => sum + (d[xKey] * d[xKey]), 0);
    const sumYY = data.reduce((sum, d) => sum + (d[yKey] * d[yKey]), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared (coefficient of determination)
    const meanY = sumY / n;
    const totalSumSquares = data.reduce((sum, d) => sum + Math.pow(d[yKey] - meanY, 2), 0);
    const residualSumSquares = data.reduce((sum, d) => {
      const predicted = slope * d[xKey] + intercept;
      return sum + Math.pow(d[yKey] - predicted, 2);
    }, 0);
    
    const rSquared = totalSumSquares === 0 ? 0 : 1 - (residualSumSquares / totalSumSquares);

    return { slope, intercept, rSquared: Math.max(0, rSquared) };
  };

  const regression = calculateLinearRegression(validHikes, xAxis, yAxis);

  // Get field labels
  const xField = dataFields.find(f => f.key === xAxis);
  const yField = dataFields.find(f => f.key === yAxis);

  return (
    <div className="visualization-page">
      <h2>Hike Data Visualization</h2>
      
      <div className="controls">
        <div className="axis-controls">
          <div className="control-group">
            <label htmlFor="x-axis">X-Axis:</label>
            <select 
              id="x-axis" 
              value={xAxis} 
              onChange={(e) => setXAxis(e.target.value)}
            >
              {dataFields.map(field => (
                <option key={field.key} value={field.key}>
                  {field.label} {field.unit && `(${field.unit})`}
                </option>
              ))}
            </select>
          </div>
          
          <div className="control-group">
            <label htmlFor="y-axis">Y-Axis:</label>
            <select 
              id="y-axis" 
              value={yAxis} 
              onChange={(e) => setYAxis(e.target.value)}
            >
              {dataFields.map(field => (
                <option key={field.key} value={field.key}>
                  {field.label} {field.unit && `(${field.unit})`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <svg width={svgDimensions.width} height={svgDimensions.height}>
          {/* Chart background */}
          <rect 
            x={margin.left} 
            y={margin.top} 
            width={chartWidth} 
            height={chartHeight} 
            fill="#f8f9fa" 
            stroke="#dee2e6"
          />
          
          {/* Grid lines */}
          {xTicks.map(tick => (
            <line
              key={`x-grid-${tick.value}`}
              x1={margin.left + tick.position}
              y1={margin.top}
              x2={margin.left + tick.position}
              y2={margin.top + chartHeight}
              stroke="#e9ecef"
              strokeWidth="1"
            />
          ))}
          
          {yTicks.map(tick => (
            <line
              key={`y-grid-${tick.value}`}
              x1={margin.left}
              y1={margin.top + tick.position}
              x2={margin.left + chartWidth}
              y2={margin.top + tick.position}
              stroke="#e9ecef"
              strokeWidth="1"
            />
          ))}
          
          {/* Regression line */}
          {regression && (
            <line
              x1={margin.left}
              y1={margin.top + yScale.scale(regression.slope * xScale.min + regression.intercept)}
              x2={margin.left + chartWidth}
              y2={margin.top + yScale.scale(regression.slope * xScale.max + regression.intercept)}
              stroke="#666"
              strokeWidth="2"
              strokeOpacity={Math.max(0.2, regression.rSquared * 0.8)}
              strokeDasharray="5,5"
            />
          )}

          {/* Data points */}
          {validHikes.map(hike => (
            <circle
              key={hike.id}
              cx={margin.left + xScale.scale(hike[xAxis])}
              cy={margin.top + yScale.scale(hike[yAxis])}
              r="4"
              fill={hike.highest_peak_elevation >= 14000 ? "#dc3545" : "#0d6efd"}
              fillOpacity="0.7"
              stroke="#fff"
              strokeWidth="1"
            >
              <title>
                {hike.name}
                {'\n'}{xField.label}: {hike[xAxis]} {xField.unit}
                {'\n'}{yField.label}: {hike[yAxis]} {yField.unit}
              </title>
            </circle>
          ))}
          
          {/* X-axis */}
          <line
            x1={margin.left}
            y1={margin.top + chartHeight}
            x2={margin.left + chartWidth}
            y2={margin.top + chartHeight}
            stroke="#333"
            strokeWidth="2"
          />
          
          {/* Y-axis */}
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={margin.top + chartHeight}
            stroke="#333"
            strokeWidth="2"
          />
          
          {/* X-axis ticks and labels */}
          {xTicks.map(tick => (
            <g key={`x-tick-${tick.value}`}>
              <line
                x1={margin.left + tick.position}
                y1={margin.top + chartHeight}
                x2={margin.left + tick.position}
                y2={margin.top + chartHeight + 5}
                stroke="#333"
                strokeWidth="1"
              />
              <text
                x={margin.left + tick.position}
                y={margin.top + chartHeight + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#333"
              >
                {tick.value}
              </text>
            </g>
          ))}
          
          {/* Y-axis ticks and labels */}
          {yTicks.map(tick => (
            <g key={`y-tick-${tick.value}`}>
              <line
                x1={margin.left - 5}
                y1={margin.top + tick.position}
                x2={margin.left}
                y2={margin.top + tick.position}
                stroke="#333"
                strokeWidth="1"
              />
              <text
                x={margin.left - 10}
                y={margin.top + tick.position + 4}
                textAnchor="end"
                fontSize="12"
                fill="#333"
              >
                {tick.value}
              </text>
            </g>
          ))}
          
          {/* Axis labels */}
          <text
            x={margin.left + chartWidth / 2}
            y={svgDimensions.height - 10}
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#333"
          >
            {xField.label} {xField.unit && `(${xField.unit})`}
          </text>
          
          <text
            x={15}
            y={margin.top + chartHeight / 2}
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#333"
            transform={`rotate(-90, 15, ${margin.top + chartHeight / 2})`}
          >
            {yField.label} {yField.unit && `(${yField.unit})`}
          </text>
        </svg>
        
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#0d6efd' }}></div>
            <span>Regular Peaks</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#dc3545' }}></div>
            <span>Fourteeners</span>
          </div>
        </div>
      </div>
      
      <div className="stats">
        <p>Showing {validHikes.length} of {allHikes.length} hikes</p>
        {regression && (
          <p>
            Linear regression: y = {regression.slope.toFixed(3)}x + {regression.intercept.toFixed(3)} 
            (R² = {regression.rSquared.toFixed(3)})
          </p>
        )}
      </div>
    </div>
  );
};

export default VisualizationPage;