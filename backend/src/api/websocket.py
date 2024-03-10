from collections import defaultdict
from typing import Any

from fastapi import WebSocket

from .fields import PyObjectId
from .models import Game


class ConnectionManager:
    def __init__(self) -> None:
        self.games: dict[PyObjectId, Any] = defaultdict(
            lambda: defaultdict(list)
        )

    async def connect(self, websocket: WebSocket, game_id: PyObjectId) -> None:
        await websocket.accept()
        self.games[game_id]["players"].append(websocket)

    def disconnect(self, websocket: WebSocket, game_id: PyObjectId) -> None:
        players = self.games[game_id]["players"]  # safe due to defaultdict
        if websocket in players:
            players.remove(websocket)

    async def broadcast_game(self, game: Game) -> None:
        json_data = game.model_dump_json()
        for connection in self.games[game.id]["players"]:
            await connection.send_json(json_data)


connection_manager = ConnectionManager()
