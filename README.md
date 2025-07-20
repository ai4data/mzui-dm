# MZUI Data Marketplace

A modern data marketplace application built with React, TypeScript, and FastAPI.

## Features

- Browse and search datasets by business domains
- View dataset details, quality scores, and metadata
- Filter datasets by business lines and categories
- Responsive design with dark/light theme support
- RESTful API backend with PostgreSQL database

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui component library
- React Router for navigation

### Backend
- FastAPI (Python)
- PostgreSQL database
- SQLAlchemy for database operations
- Uvicorn ASGI server

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL database

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to API directory
cd api

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.\.venv\Scripts\Activate.ps1
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template and configure
cp .env.example .env
# Edit .env with your database credentials

# Start API server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Database Setup
Ensure your PostgreSQL database is running and accessible with the credentials specified in your `.env` file.

## Development

The application runs on:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## License

This project is licensed under the MIT License - see the LICENSE file for details.