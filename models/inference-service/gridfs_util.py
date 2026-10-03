"""Utility to download files from MongoDB GridFS by ObjectId hex string."""
import io
import os
from gridfs import GridFS
import pymongo


def get_mongo_client():
    uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/curearly")
    return pymongo.MongoClient(uri)


def download_file(grid_fs_id: str) -> bytes:
    """Download a file from GridFS and return its bytes."""
    client = get_mongo_client()
    # Parse DB name from URI
    db_name = "curearly"
    uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/curearly")
    if "/" in uri:
        path = uri.split("/")[-1].split("?")[0]
        if path:
            db_name = path
    db = client[db_name]
    fs = GridFS(db)
    from bson import ObjectId
    grid_out = fs.get(ObjectId(grid_fs_id))
    return grid_out.read()
