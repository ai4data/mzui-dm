import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_database_url():
    """
    Get database URL, supporting both direct connection and connection string.
    Prioritizes DATABASE_URL if provided (useful for Supabase and other cloud providers).
    """
    # Check if full DATABASE_URL is provided (common for cloud providers like Supabase)
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url
    
    # Fallback to individual connection parameters
    DB_CONFIG = {
        "host": os.getenv("DB_HOST", "localhost"),
        "database": os.getenv("DB_NAME", "data_marketplace"),
        "user": os.getenv("DB_USER", "postgres"),
        "password": os.getenv("DB_PASSWORD", ""),
        "port": int(os.getenv("DB_PORT", 5432)),
    }
    
    return f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"

# Get database URL
DATABASE_URL = get_database_url()

# Create SQLAlchemy engine with Supabase-friendly settings
engine_kwargs = {
    "pool_pre_ping": False,  # Skip ping to reduce latency
    "pool_recycle": 3600,    # Longer recycle time
    "pool_size": 1,          # Single connection for simplicity
    "max_overflow": 0,       # No overflow
    "pool_timeout": 10,      # Shorter timeout
    "echo": False,           # Disable SQL logging
}

# Add SSL requirement for cloud databases (like Supabase)
if "supabase.co" in DATABASE_URL or os.getenv("DB_HOST", "").endswith("supabase.co"):
    engine_kwargs["connect_args"] = {"sslmode": "require"}

print(f"🔗 Connecting to database: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'local database'}")

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Database dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Test connection function
def test_connection():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT COUNT(*) FROM datasets"))
            count = result.scalar()
            print(f"✅ Database connected! Found {count} datasets")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
