from fastapi import APIRouter

from ..db.client import MongoDBClient
from .models import Game, StartGame

router = APIRouter(prefix="/games", tags=["Games"])


@router.post("/")
async def start_new_game(player_data: StartGame) -> Game:
    data = {"player1": player_data.player, "player2": player_data.player}

    client = MongoDBClient()
    inserted_result = await client.insert(Game, data)  # type: ignore[arg-type]
    game_data = await client.get(
        Game,  # type: ignore[arg-type]
        inserted_result.inserted_id,
    )
    result = Game(**game_data)

    return result
