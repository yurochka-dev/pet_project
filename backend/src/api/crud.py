from typing import Any

from ..api.fields import PyObjectId
from ..core import init_board
from ..db.client import MongoDBClient
from .models import Game


async def start_new_game(player1: str) -> Game | None:
    game_data = {"player1": player1, "board": init_board()}
    client = MongoDBClient()
    inserted_result = await client.insert(Game, game_data)  # type: ignore[arg-type]
    return await get_game_by_id(inserted_result.inserted_id)


async def get_game_by_id(id: PyObjectId) -> Game | None:
    client = MongoDBClient()
    game_data = await client.get(Game, id)  # type: ignore[arg-type]
    if game_data is None:
        return None
    return Game(**game_data)


async def list_games_from_db() -> list[dict[str, Any]]:
    client = MongoDBClient()
    return await client.list(Game)  # type: ignore[arg-type]


async def delete_games_from_db() -> int:
    client = MongoDBClient()
    result = await client.delete_many(Game)  # type: ignore[arg-type]
    return result.deleted_count


async def join_new_game(game: Game, player2: str) -> Game | None:
    game_data = game.model_dump() | {"player2": player2}
    return await update_game(game.id, game_data)


async def update_game(
    game_id: PyObjectId, game_data: dict[str, Any]
) -> Game | None:
    client = MongoDBClient()
    await client.update_one(Game, game_id, game_data)  # type: ignore[arg-type]
    return await get_game_by_id(game_id)
