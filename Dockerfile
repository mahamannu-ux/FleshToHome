# 1. Use an official Python runtime as a parent image
FROM python:3.11-slim

# 2. Set the working directory in the container
WORKDIR /app

# 3. Copy only requirements first (to leverage Docker caching)
COPY requirements.txt .

# 4. Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy entire project into the container
COPY . .

# 6. Create a directory for  SQLite database 
# (Make sure your main.py points to '/app/data/freshmeat.db')
RUN mkdir -p /app/data

# 7. Start the application
# Use the PORT environment variable provided by Google Cloud Run
CMD uvicorn ./backend/main:app --host 0.0.0.0 --port ${PORT:-8080}