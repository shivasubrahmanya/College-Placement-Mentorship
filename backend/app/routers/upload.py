"""
File Upload Router - Presigned URL generation for S3
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from app.utils.auth import get_current_active_user
from app.models.user import User
from app.utils.storage import generate_presigned_upload_url, generate_presigned_download_url

router = APIRouter(prefix="/upload", tags=["upload"])


class UploadRequest(BaseModel):
    file_name: str
    content_type: str = "application/octet-stream"
    file_type: str = "resource"  # "resource" or "post"


class UploadResponse(BaseModel):
    upload_url: str
    file_key: str
    download_url: str


@router.post("/presigned-url", response_model=UploadResponse)
def get_presigned_upload_url(
    upload_request: UploadRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Generate a presigned URL for uploading a file to S3
    
    Returns:
        - upload_url: URL to upload the file (PUT request)
        - file_key: S3 object key to store in database
        - download_url: URL to download the file later
    """
    import uuid
    from datetime import datetime
    
    # Generate unique file key
    timestamp = datetime.now().strftime("%Y%m%d")
    file_extension = upload_request.file_name.split('.')[-1] if '.' in upload_request.file_name else ''
    file_key = f"{upload_request.file_type}/{current_user.id}/{timestamp}/{uuid.uuid4()}.{file_extension}"
    
    # Generate presigned upload URL
    upload_url = generate_presigned_upload_url(
        file_key=file_key,
        content_type=upload_request.content_type,
        expiration=3600  # 1 hour
    )
    
    # Generate presigned download URL (for later use)
    download_url = generate_presigned_download_url(
        file_key=file_key,
        expiration=86400 * 7  # 7 days
    )
    
    if not upload_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate upload URL"
        )
    
    return UploadResponse(
        upload_url=upload_url,
        file_key=file_key,
        download_url=download_url
    )


@router.get("/download-url/{file_key}")
def get_download_url(
    file_key: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Generate a presigned download URL for an existing file
    """
    download_url = generate_presigned_download_url(
        file_key=file_key,
        expiration=3600  # 1 hour
    )
    
    if not download_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    return {"download_url": download_url}

