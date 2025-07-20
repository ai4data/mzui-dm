#!/usr/bin/env python3
"""
Migration script to help set up the database schema in Supabase.
This script will create the necessary tables and can be used to verify the connection.
"""

import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_database_url():
    """Get the database URL from environment variables."""
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url
    
    # Fallback to individual parameters
    host = os.getenv("DB_HOST", "localhost")
    database = os.getenv("DB_NAME", "postgres")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "")
    port = os.getenv("DB_PORT", "5432")
    
    return f"postgresql://{user}:{password}@{host}:{port}/{database}"

def test_connection():
    """Test the database connection."""
    try:
        database_url = get_database_url()
        print(f"Testing connection to: {database_url.split('@')[1] if '@' in database_url else 'database'}")
        
        # Create engine with SSL for Supabase
        engine_kwargs = {"pool_pre_ping": True}
        if "supabase.com" in database_url:
            engine_kwargs["connect_args"] = {"sslmode": "require"}
        
        engine = create_engine(database_url, **engine_kwargs)
        
        with engine.connect() as connection:
            # Test basic connection
            result = connection.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"✅ Connected successfully!")
            print(f"PostgreSQL version: {version}")
            
            # Check if our tables exist
            tables_query = """
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('datasets', 'dataset_metrics', 'data_owners')
            ORDER BY table_name
            """
            
            result = connection.execute(text(tables_query))
            existing_tables = [row[0] for row in result]
            
            print(f"\nExisting tables: {existing_tables}")
            
            if 'datasets' in existing_tables:
                # Count datasets
                count_result = connection.execute(text("SELECT COUNT(*) FROM datasets"))
                count = count_result.scalar()
                print(f"📊 Found {count} datasets in the database")
                
                # Show sample business lines
                bl_result = connection.execute(text("SELECT DISTINCT business_line FROM datasets LIMIT 5"))
                business_lines = [row[0] for row in bl_result]
                print(f"📈 Sample business lines: {business_lines}")
            else:
                print("⚠️  Tables not found. You may need to run the database migration.")
            
            return True
            
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

def create_sample_schema():
    """Create basic schema if tables don't exist (for testing purposes)."""
    try:
        database_url = get_database_url()
        engine_kwargs = {"pool_pre_ping": True}
        if "supabase.com" in database_url:
            engine_kwargs["connect_args"] = {"sslmode": "require"}
        
        engine = create_engine(database_url, **engine_kwargs)
        
        # Basic schema creation (minimal for testing)
        schema_sql = """
        -- Create datasets table if it doesn't exist
        CREATE TABLE IF NOT EXISTS datasets (
            id VARCHAR(50) PRIMARY KEY,
            technical_id VARCHAR(100),
            name VARCHAR(500) NOT NULL,
            description TEXT,
            business_line VARCHAR(200),
            business_entity VARCHAR(200),
            maturity VARCHAR(100),
            data_lifecycle VARCHAR(100),
            location VARCHAR(200),
            data_domain VARCHAR(200),
            data_subdomain VARCHAR(200),
            data_expert VARCHAR(200),
            data_validator VARCHAR(200),
            data_classification VARCHAR(100),
            legal_ground_collection TEXT,
            unlocked_gdp VARCHAR(100),
            cia_rating VARCHAR(100),
            number_of_data_elements INTEGER DEFAULT 0,
            historical_data BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            business_description TEXT,
            business_impact TEXT,
            maturity_description TEXT,
            classification_description TEXT,
            source_sys_id VARCHAR(100),
            source_sys_name VARCHAR(200)
        );

        -- Create dataset_metrics table if it doesn't exist
        CREATE TABLE IF NOT EXISTS dataset_metrics (
            id SERIAL PRIMARY KEY,
            dataset_id VARCHAR(50) REFERENCES datasets(id),
            quality_score INTEGER DEFAULT 0,
            completeness INTEGER DEFAULT 0,
            accuracy INTEGER DEFAULT 0,
            timeliness INTEGER DEFAULT 0,
            usage_count INTEGER DEFAULT 0,
            average_rating DECIMAL(3,2) DEFAULT 0.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create data_owners table if it doesn't exist
        CREATE TABLE IF NOT EXISTS data_owners (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            email VARCHAR(200),
            department VARCHAR(200),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create dataset_owners junction table if it doesn't exist
        CREATE TABLE IF NOT EXISTS dataset_owners (
            id SERIAL PRIMARY KEY,
            dataset_id VARCHAR(50) REFERENCES datasets(id),
            owner_id VARCHAR(50) REFERENCES data_owners(id),
            role VARCHAR(50) DEFAULT 'owner',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        with engine.connect() as connection:
            connection.execute(text(schema_sql))
            connection.commit()
            print("✅ Schema created successfully!")
            
    except Exception as e:
        print(f"❌ Schema creation failed: {e}")

def main():
    """Main function to run the migration script."""
    print("🚀 MZUI Data Marketplace - Supabase Migration Tool")
    print("=" * 50)
    
    if len(sys.argv) > 1 and sys.argv[1] == "--create-schema":
        print("Creating basic schema...")
        create_sample_schema()
    
    print("Testing database connection...")
    success = test_connection()
    
    if success:
        print("\n✅ Migration check completed successfully!")
        print("You can now start the API server with: python -m uvicorn main:app --reload")
    else:
        print("\n❌ Migration check failed!")
        print("Please check your .env file and database credentials.")
        sys.exit(1)

if __name__ == "__main__":
    main()