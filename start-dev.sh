#!/bin/bash

# This script starts both the backend and frontend development servers concurrently.

echo "Starting DataHub Workspace development environment..."

# Function to clean up background processes on exit
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID
    exit
}

# Trap the exit signal (like Ctrl+C) to run the cleanup function
trap cleanup SIGINT

# 1. Start the Backend Server
echo "Starting Spring Boot backend server..."
cd backend-api
./mvnw spring-boot:run & # The '&' runs the process in the background
BACKEND_PID=$! # Store the process ID of the backend server
cd ..

# 2. Start the Frontend Server
echo "Starting React frontend server..."
cd frontend
npm run dev & # The '&' runs the process in the background
FRONTEND_PID=$! # Store the process ID of the frontend server
cd ..

echo "-------------------------------------------"
echo "Backend server (PID: $BACKEND_PID) is starting on http://localhost:8080"
echo "Frontend server (PID: $FRONTEND_PID) is starting on http://localhost:5173"
echo "-------------------------------------------"
echo "Press Ctrl+C to stop both servers."

# Wait for the background processes to finish (which they won't until you stop them)
wait