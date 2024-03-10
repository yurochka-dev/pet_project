import importlib
from datetime import datetime, timezone
from typing import Any, cast

from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorCollection, AsyncIOMotorDatabase
from pymongo.results import DeleteResult, InsertOneResult, UpdateResult

from src.api.models import MongoDBModel

from ..api.fields import PyObjectId


class MongoDBClient:
    __instance = None
    mongodb: AsyncIOMotorDatabase

    def __new__(cls) -> "MongoDBClient":
        if cls.__instance is None:
            cls.__instance = super().__new__(cls)
            app = get_current_app()
            cls.__instance.mongodb = app.mongodb  # type: ignore[attr-defined]
        return cls.__instance

    def get_collection(self, model: MongoDBModel) -> AsyncIOMotorCollection:
        collection_name = model.get_collection_name()
        return self.mongodb.get_collection(collection_name)

    async def insert(
        self, model: MongoDBModel, data: dict[str, Any]
    ) -> InsertOneResult:
        collection = self.get_collection(model)
        now = datetime.now(timezone.utc)
        data |= {"created_at": now, "updated_at": now}
        return await collection.insert_one(data)

    async def get(self, model: MongoDBModel, id: str) -> dict[str, Any] | None:
        collection = self.get_collection(model)

        result = await collection.find_one({"_id": id})
        if result is None:
            return None

        result = cast(dict[str, Any], result)
        return result | {"id": result.pop("_id")}  # _id -> id

    async def list(self, model: MongoDBModel) -> list[dict[str, Any]]:
        collection = self.get_collection(model)
        result = collection.find({})
        games = []
        async for game in result:
            game = cast(dict[str, Any], game)
            games.append(game | {"id": game.pop("_id")})
        return games

    async def delete_many(self, model: MongoDBModel) -> DeleteResult:
        collection = self.get_collection(model)
        return await collection.delete_many({})

    async def update_one(
        self, model: MongoDBModel, id: PyObjectId, data: dict[str, Any]
    ) -> UpdateResult:
        collection = self.get_collection(model)
        data |= {"updated_at": datetime.now()}
        return await collection.update_one({"_id": id}, {"$set": data})


def get_current_app() -> FastAPI:
    module = importlib.import_module("src.main")
    field = "app"
    return cast(FastAPI, getattr(module, field))
