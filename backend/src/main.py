from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI

from .api.views import router as api_router
from .db.utils import get_mongodb_client
from .pet_project.settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # set up MongoDB
    client = get_mongodb_client()
    db = client.get_database(settings.MONGO_DB_DB)
    app.mongodb = db  # type: ignore[attr-defined]
    yield
    # close MongoDB connection
    client.close()


app = FastAPI(lifespan=lifespan)
app.include_router(api_router)


@app.get("/")
async def read_root() -> dict[str, str]:
    return {"Hello": "pet project world"}
