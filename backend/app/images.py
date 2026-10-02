import io

import cloudinary
import cloudinary.exceptions
import cloudinary.uploader
from fastapi import HTTPException, UploadFile, status

from app.config import (
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME,
)

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True,  # always give back https:// URLs
)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_BYTES = 10 * 1024 * 1024  # 10 MB: generous for a phone photo
FOLDER = "kicksjj/products"


def upload_product_image(file: UploadFile) -> dict:
    """Validate an uploaded image, send it to Cloudinary, return its URL."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only JPEG, PNG or WebP images are allowed",
        )

    # Read one byte past the limit: if we get it, the file is too big
    data = file.file.read(MAX_BYTES + 1)
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(data) > MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image is larger than 10 MB",
        )

    try:
        result = cloudinary.uploader.upload(
            io.BytesIO(data),
            folder=FOLDER,
            resource_type="image",
            # Shrink before storing: nothing needs to be bigger than 1600px
            transformation=[
                {"width": 1600, "height": 1600, "crop": "limit", "quality": "auto"}
            ],
        )
    except cloudinary.exceptions.Error:
        raise HTTPException(status_code=502, detail="Image upload failed")

    return {"url": result["secure_url"], "public_id": result["public_id"]}