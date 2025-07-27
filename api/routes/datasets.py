from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from database.connection import get_db

router = APIRouter(prefix="/api/datasets", tags=["datasets"])


@router.get("/")
async def get_datasets(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    business_line: Optional[str] = None,
    data_domain: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Get paginated list of datasets with optional filtering"""

    # Base query with data expert as owner
    query = """
    SELECT 
        d.id,
        d.name,
        d.description,
        d.business_line,
        d.data_domain,
        d.maturity,
        dm.quality_score,
        dm.average_rating,
        dm.usage_count,
        d.updated_at,
        d.data_expert,
        d.data_validator,
        d.source_sys_id,
        d.source_sys_name
    FROM datasets d
    LEFT JOIN dataset_metrics dm ON d.id = dm.dataset_id
    WHERE 1=1
    """

    params = {}

    # Add search filter
    if search:
        query += " AND (d.name ILIKE :search OR d.description ILIKE :search)"
        params["search"] = f"%{search}%"

    # Add business line filter
    if business_line:
        query += " AND d.business_line = :business_line"
        params["business_line"] = business_line

    # Add data domain filter
    if data_domain:
        query += " AND d.data_domain = :data_domain"
        params["data_domain"] = data_domain

    # Add pagination
    offset = (page - 1) * limit
    query += " ORDER BY d.updated_at DESC LIMIT :limit OFFSET :offset"
    params["limit"] = limit
    params["offset"] = offset

    # Execute query
    result = db.execute(text(query), params)
    datasets = []

    for row in result:
        datasets.append(
            {
                "id": row[0],
                "name": row[1],
                "description": row[2],
                "businessLine": row[3],
                "dataDomain": row[4],
                "maturity": row[5],
                "updatedAt": row[9].isoformat() if row[9] else None,
                "sourceSysId": row[12],
                "sourceSysName": row[13],
                "metrics": {
                    "qualityScore": row[6] if row[6] is not None else 0,
                    "averageRating": row[7] if row[7] is not None else 0,
                    "usageCount": row[8] if row[8] is not None else 0,
                    "completeness": 0,  # Default values for missing metrics
                    "accuracy": 0,
                    "timeliness": 0,
                },
                # Use data expert as the data owner
                "dataOwner": {
                    "id": "",
                    "name": row[10] if row[10] else "Unknown",  # data_expert
                    "email": "",
                    "department": "",
                },
                "dataClassification": "Internal",
                "tags": [],
                "numberOfDataElements": 0,
            }
        )

    # Get total count
    count_query = "SELECT COUNT(*) FROM datasets d WHERE 1=1"
    if search:
        count_query += " AND (d.name ILIKE :search OR d.description ILIKE :search)"
    if business_line:
        count_query += " AND d.business_line = :business_line"
    if data_domain:
        count_query += " AND d.data_domain = :data_domain"

    count_params = {k: v for k, v in params.items() if k not in ["limit", "offset"]}
    total_result = db.execute(text(count_query), count_params)
    total_count = total_result.scalar()

    return {
        "datasets": datasets,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total_count,
            "pages": (total_count + limit - 1) // limit,
        },
    }


@router.get("/{dataset_id}")
async def get_dataset_detail(dataset_id: str, db: Session = Depends(get_db)):
    """Get detailed information about a specific dataset"""

    try:
        # Simple query first - just get basic dataset info
        query = """
        SELECT 
            id, technical_id, name, description, business_line, business_entity,
            maturity, data_lifecycle, location, data_domain, data_subdomain,
            data_expert, data_validator, data_classification,
            created_at, updated_at, source_sys_id, source_sys_name
        FROM datasets 
        WHERE id = :dataset_id
        """

        result = db.execute(text(query), {"dataset_id": dataset_id})
        row = result.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Dataset not found")

        # Get metrics separately
        metrics_query = """
        SELECT quality_score, completeness, accuracy, timeliness, usage_count, average_rating
        FROM dataset_metrics 
        WHERE dataset_id = :dataset_id
        """
        metrics_result = db.execute(text(metrics_query), {"dataset_id": dataset_id})
        metrics_row = metrics_result.fetchone()

        # Get tags
        tags_query = """
        SELECT t.name
        FROM tags t
        JOIN dataset_tags dt ON t.id = dt.tag_id
        WHERE dt.dataset_id = :dataset_id
        """
        tags_result = db.execute(text(tags_query), {"dataset_id": dataset_id})
        tags = [tag_row[0] for tag_row in tags_result]

        # Get ratings
        ratings_query = """
        SELECT r.id, r.user_id, u.name, r.rating, r.comment, r.created_at
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        WHERE r.dataset_id = :dataset_id
        ORDER BY r.created_at DESC
        """
        ratings_result = db.execute(text(ratings_query), {"dataset_id": dataset_id})
        ratings = []

        for rating_row in ratings_result:
            ratings.append(
                {
                    "id": rating_row[0],
                    "userId": rating_row[1],
                    "userName": rating_row[2],
                    "rating": rating_row[3],
                    "comment": rating_row[4],
                    "createdAt": rating_row[5].isoformat() if rating_row[5] else None,
                }
            )

        # Get use cases (stories)
        stories_query = """
        SELECT uc.id, uc.title, uc.author, uc.business_line, uc.summary, uc.content
        FROM use_cases uc
        JOIN dataset_use_cases duc ON uc.id = duc.use_case_id
        WHERE duc.dataset_id = :dataset_id
        """
        stories_result = db.execute(text(stories_query), {"dataset_id": dataset_id})
        stories = []

        for story_row in stories_result:
            stories.append(
                {
                    "id": story_row[0],
                    "title": story_row[1],
                    "author": story_row[2],
                    "businessLine": story_row[3],
                    "summary": story_row[4],
                    "content": story_row[5],
                }
            )

        # Get data owners
        owners_query = """
        SELECT owner.id, owner.name, owner.email, owner.department, dow.role
        FROM data_owners owner
        JOIN dataset_owners dow ON owner.id = dow.owner_id
        WHERE dow.dataset_id = :dataset_id
        """
        owners_result = db.execute(text(owners_query), {"dataset_id": dataset_id})
        data_owner = None
        data_steward = None

        for owner_row in owners_result:
            owner_data = {
                "id": owner_row[0],
                "name": owner_row[1],
                "email": owner_row[2],
                "department": owner_row[3],
            }
            if owner_row[4] == "owner":
                data_owner = owner_data
            elif owner_row[4] == "steward":
                data_steward = owner_data

        # Get related datasets
        related_query = """
        SELECT rd.related_dataset_id, d.name, d.description, rd.relationship_type, rd.similarity_score
        FROM related_datasets rd
        JOIN datasets d ON rd.related_dataset_id = d.id
        WHERE rd.dataset_id = :dataset_id
        """
        related_result = db.execute(text(related_query), {"dataset_id": dataset_id})
        related_datasets = []

        for related_row in related_result:
            related_datasets.append(
                {
                    "id": related_row[0],
                    "name": related_row[1],
                    "description": related_row[2],
                    "relationshipType": related_row[3],
                    "similarityScore": related_row[4],
                }
            )

        # Get preview data
        preview_query = """
        SELECT columns, sample_data, row_count
        FROM dataset_preview
        WHERE dataset_id = :dataset_id
        """
        preview_result = db.execute(text(preview_query), {"dataset_id": dataset_id})
        preview_row = preview_result.fetchone()

        # Build response
        dataset = {
            "id": row[0],
            "technicalId": row[1],
            "name": row[2],
            "description": row[3],
            "businessLine": row[4],
            "businessEntity": row[5],
            "maturity": row[6],
            "dataLifecycle": row[7],
            "location": row[8],
            "dataDomain": row[9],
            "dataSubDomain": row[10],
            "dataExpert": row[11],
            "dataValidator": row[12],
            "dataClassification": row[13],
            "createdAt": row[14].isoformat() if row[14] else None,
            "updatedAt": row[15].isoformat() if row[15] else None,
            "sourceSysId": row[16],
            "sourceSysName": row[17],
            "dataOwner": data_owner,
            "dataSteward": data_steward,
            "tags": tags,
            "ratings": ratings,
            "stories": stories,
            "relatedDatasets": related_datasets,
            "metrics": {
                "qualityScore": metrics_row[0] if metrics_row else None,
                "completeness": metrics_row[1] if metrics_row else None,
                "accuracy": metrics_row[2] if metrics_row else None,
                "timeliness": metrics_row[3] if metrics_row else None,
                "usageCount": metrics_row[4] if metrics_row else None,
                "averageRating": metrics_row[5] if metrics_row else None,
            }
            if metrics_row
            else None,
            "preview": {
                "columns": preview_row[0] if preview_row else None,
                "sampleData": preview_row[1] if preview_row else None,
                "rowCount": preview_row[2] if preview_row else None,
            }
            if preview_row
            else None,
        }

        return dataset

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/test/{dataset_id}")
async def test_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Simple test to check if dataset exists"""
    try:
        # Very simple query first
        query = "SELECT id, name FROM datasets WHERE id = :dataset_id"
        result = db.execute(text(query), {"dataset_id": dataset_id})
        row = result.fetchone()

        if not row:
            return {"error": "Dataset not found"}

        return {"id": row[0], "name": row[1], "message": "Dataset found successfully"}
    except Exception as e:
        return {"error": str(e)}
