# Supabase Setup Guide

This guide will help you set up the MZUI Data Marketplace with Supabase as the database backend.

## Prerequisites

1. A Supabase account (free tier is sufficient for testing)
2. Your existing PostgreSQL database with the data marketplace schema and data

## Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Choose a project name (e.g., "mzui-data-marketplace")
3. Set a strong database password
4. Select a region (preferably close to your users)

## Step 2: Get Connection Details

From your Supabase project dashboard:

1. Go to **Settings** → **Database**
2. Find the **Connection string** section
3. Copy the connection string (it should look like the one in `.env.supabase.example`)

Your connection details:
- **Host**: `aws-0-eu-west-1.pooler.supabase.com`
- **Database**: `postgres`
- **User**: `postgres.hazgrtuqxwnbavzuoatv`
- **Port**: `6543`

## Step 3: Configure Environment

1. Copy the Supabase environment template:
   ```bash
   cp api/.env.supabase.example api/.env
   ```

2. Edit `api/.env` and replace `[YOUR-PASSWORD]` with your actual Supabase database password

## Step 4: Migrate Your Database Schema

You have several options to migrate your existing database to Supabase:

### Option A: Using pg_dump and psql (Recommended)

1. **Export your local database**:
   ```bash
   pg_dump -h localhost -U postgres -d data_marketplace --schema-only > schema.sql
   pg_dump -h localhost -U postgres -d data_marketplace --data-only > data.sql
   ```

2. **Import to Supabase**:
   ```bash
   # Import schema
   psql "postgresql://postgres.hazgrtuqxwnbavzuoatv:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres" < schema.sql
   
   # Import data
   psql "postgresql://postgres.hazgrtuqxwnbavzuoatv:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres" < data.sql
   ```

### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create tables manually using SQL commands
4. Use **Table Editor** to insert sample data

## Step 5: Test the Connection

1. **Activate your Python virtual environment**:
   ```bash
   cd api
   .\.venv\Scripts\Activate.ps1  # Windows
   # or
   source .venv/bin/activate     # Linux/Mac
   ```

2. **Test the database connection**:
   ```bash
   python -c "from database.connection import test_connection; test_connection()"
   ```

3. **Start the API server**:
   ```bash
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Test the API**:
   ```bash
   curl http://localhost:8000/api/datasets?limit=5
   ```

## Step 6: Run the Frontend

1. **Install frontend dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:5173`

## Troubleshooting

### Connection Issues

- **SSL Error**: Make sure your connection string includes SSL parameters
- **Timeout**: Supabase has connection pooling; try reducing concurrent connections
- **Authentication**: Double-check your password and user credentials

### Performance Considerations

- Supabase free tier has limitations on concurrent connections
- Consider using connection pooling for production
- Monitor your database usage in the Supabase dashboard

### Common Errors

1. **"relation does not exist"**: Your tables haven't been created yet
2. **"password authentication failed"**: Check your password in the `.env` file
3. **"connection timeout"**: Network issue or incorrect host/port

## Next Steps

Once everything is working:

1. Test all application features (browsing, filtering, search)
2. Verify data integrity and performance
3. Consider setting up automated backups
4. Review Supabase security settings

## Supabase Features to Explore

- **Real-time subscriptions**: For live data updates
- **Row Level Security (RLS)**: For data access control
- **Edge Functions**: For serverless API endpoints
- **Storage**: For file uploads (dataset files, images)