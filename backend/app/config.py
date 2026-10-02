import os
from dotenv import load_dotenv

load_dotenv()


def _require(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"{name} is not set. Check your .env file.")
    return value


DATABASE_URL = _require("DATABASE_URL")

# --- Admin auth ---
SECRET_KEY = _require("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "720"))

ADMIN_USERNAME = _require("ADMIN_USERNAME")
ADMIN_PASSWORD_HASH = _require("ADMIN_PASSWORD_HASH")

# --- Cloudinary (image uploads) ---
CLOUDINARY_CLOUD_NAME = _require("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = _require("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = _require("CLOUDINARY_API_SECRET")

# --- CORS: which frontend origins may call this API (comma-separated) ---
CORS_ORIGINS = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if o.strip()
]