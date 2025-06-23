#!/bin/bash
# Script to run the Summit Hikes application

echo "Starting Summit Hikes Application..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Install Python dependencies
echo "Installing Python dependencies..."
./venv/bin/pip install -r requirements.txt

# Check if database exists
if [ ! -f "summit_hikes.db" ]; then
    echo "Creating database from JSON data..."
    ./venv/bin/python import_data.py
fi

# Start the API server
echo "Starting API server on http://localhost:8000..."
./venv/bin/python simple_api.py &
API_PID=$!
echo "API server started with PID: $API_PID"

# Give the API a moment to start
sleep 2

# Start the frontend development server
echo "Starting frontend development server..."
echo "Frontend will be available at http://localhost:5173"
cd summit-hikes-app && npm install && npm run dev

# When the frontend server is stopped, also stop the API
echo "Stopping API server..."
kill $API_PID