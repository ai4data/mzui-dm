# Database Switching Guide

This guide explains how to easily switch between different database configurations for the MZUI Data Marketplace.

## Available Databases

| Database | Location | Performance | Use Case |
|----------|----------|-------------|----------|
| **Local** | Your machine | Fast | Development |
| **Supabase** | EU-West-1 | Slower | Cloud testing |
| **Supabase2** | EU-Central-1 | Medium | Production |

## Quick Switching

### Method 1: Using the Switch Script (Recommended)

```bash
cd api

# Switch to local PostgreSQL
python switch_database.py local

# Switch to Supabase2 (current active)
python switch_database.py supabase2

# Switch to original Supabase
python switch_database.py supabase

# Check current database
python switch_database.py current
```

### Method 2: Manual File Copying

```bash
cd api

# Switch to local
cp .env.local .env

# Switch to Supabase2
cp .env.supabase2 .env

# Switch to original Supabase
cp .env.supabase .env
```

## After Switching

**Always restart the API server** after switching databases:

```bash
# Stop current server (Ctrl+C)
# Then restart:
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Configuration Files

- **`.env`** - Currently active configuration
- **`.env.local`** - Local PostgreSQL settings
- **`.env.supabase`** - Original Supabase (EU-West-1)
- **`.env.supabase2`** - Supabase2 (EU-Central-1) - Current default
- **`.env.example`** - Template for new setups

## Testing Connection

After switching, test the connection:

```bash
python migrate_to_supabase.py
```

## Troubleshooting

### Connection Issues
- **Local**: Make sure PostgreSQL is running
- **Supabase**: Check internet connection and credentials
- **Wrong password**: Update the password in the respective `.env.*` file

### Performance Issues
- **Local**: Fastest (no network latency)
- **Supabase2**: Better performance (EU-Central-1)
- **Supabase**: Slower (EU-West-1, farther region)

## Current Status

✅ **Currently active**: Supabase2 (EU-Central-1)
- Fast cloud database
- 2,009 datasets available
- All features working

## Security Note

- Environment files (`.env.*`) are excluded from Git
- Never commit database credentials to version control
- Use `.env.example` files for sharing configuration templates