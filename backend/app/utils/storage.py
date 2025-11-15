"""
Cloud Storage Utilities for AWS S3 (or compatible) presigned URLs
"""
import os
from typing import Optional
from datetime import timedelta
from app.config import settings

# Mock S3 configuration - Replace with actual AWS credentials in production
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME", "mentorship-platform")
AWS_S3_ENDPOINT = os.getenv("AWS_S3_ENDPOINT", None)  # For S3-compatible services

try:
    import boto3
    from botocore.config import Config
    from botocore.exceptions import ClientError
    
    # Initialize S3 client
    s3_config = Config(
        region_name=AWS_REGION,
        signature_version='s3v4'
    )
    
    if AWS_S3_ENDPOINT:
        # For S3-compatible services (MinIO, DigitalOcean Spaces, etc.)
        s3_client = boto3.client(
            's3',
            endpoint_url=AWS_S3_ENDPOINT,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            config=s3_config
        )
    else:
        # Standard AWS S3
        s3_client = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            config=s3_config
        )
    
    S3_AVAILABLE = True
except ImportError:
    S3_AVAILABLE = False
    s3_client = None


def generate_presigned_upload_url(
    file_key: str,
    content_type: str = "application/octet-stream",
    expiration: int = 3600
) -> Optional[str]:
    """
    Generate a presigned URL for uploading a file to S3
    
    Args:
        file_key: S3 object key (path/filename)
        content_type: MIME type of the file
        expiration: URL expiration time in seconds (default: 1 hour)
    
    Returns:
        Presigned URL string or None if S3 is not configured
    """
    if not S3_AVAILABLE or not s3_client:
        # Return mock URL for development
        return f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{file_key}"
    
    try:
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': AWS_BUCKET_NAME,
                'Key': file_key,
                'ContentType': content_type
            },
            ExpiresIn=expiration
        )
        return presigned_url
    except ClientError as e:
        print(f"Error generating presigned URL: {e}")
        return None


def generate_presigned_download_url(
    file_key: str,
    expiration: int = 3600
) -> Optional[str]:
    """
    Generate a presigned URL for downloading a file from S3
    
    Args:
        file_key: S3 object key (path/filename)
        expiration: URL expiration time in seconds (default: 1 hour)
    
    Returns:
        Presigned URL string or None if S3 is not configured
    """
    if not S3_AVAILABLE or not s3_client:
        # Return mock URL for development
        return f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{file_key}"
    
    try:
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': AWS_BUCKET_NAME,
                'Key': file_key
            },
            ExpiresIn=expiration
        )
        return presigned_url
    except ClientError as e:
        print(f"Error generating presigned URL: {e}")
        return None


def delete_file_from_s3(file_key: str) -> bool:
    """
    Delete a file from S3
    
    Args:
        file_key: S3 object key (path/filename)
    
    Returns:
        True if successful, False otherwise
    """
    if not S3_AVAILABLE or not s3_client:
        return False
    
    try:
        s3_client.delete_object(Bucket=AWS_BUCKET_NAME, Key=file_key)
        return True
    except ClientError as e:
        print(f"Error deleting file from S3: {e}")
        return False

