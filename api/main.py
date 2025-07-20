from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database.connection import get_db, test_connection
from routes.datasets import router as datasets_router  # Add this import

# Create FastAPI app
app = FastAPI(
    title="Data Marketplace API",
    description="API for the Data Marketplace application",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include dataset routes
app.include_router(datasets_router)  # Add this line

# Health check endpoint
@app.get("/")
async def root():
    return {"message": "Data Marketplace API is running!"}

# Database health check
@app.get("/health")
async def health_check():
    db_status = test_connection()
    return {
        "status": "healthy" if db_status else "unhealthy",
        "database": "connected" if db_status else "disconnected"
    }

# Test endpoint to get dataset count
@app.get("/api/datasets/count")
async def get_dataset_count(db: Session = Depends(get_db)):
    from sqlalchemy import text
    result = db.execute(text("SELECT COUNT(*) FROM datasets"))
    count = result.scalar()
    return {"total_datasets": count}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
