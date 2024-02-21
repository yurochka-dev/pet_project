from motor.motor_asyncio import AsyncIOMotorClient

from ..pet_project.settings import settings


def get_mongodb_client() -> AsyncIOMotorClient:
    """Get MongoDB client instance"""
    return AsyncIOMotorClient(settings.MONGO_DB_URL)
