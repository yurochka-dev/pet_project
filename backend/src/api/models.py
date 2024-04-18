from datetime import datetime
from typing import Any

from pydantic import (
    BaseModel,
    Field,
    NonNegativeInt,
    ValidationError,
    computed_field,
)

from ..constants import PlayerEnum
from .fields import PyObjectId


class MongoDBModel(BaseModel):
    class Meta:
        collection_name: str

    id: PyObjectId
    created_at: datetime
    updated_at: datetime

    @classmethod
    def get_collection_name(cls) -> str:
        return cls.Meta.collection_name


class StartGame(BaseModel):
    player: str


class Move(BaseModel):
    row: int
    col: int
    val: int


class Game(MongoDBModel):
    class Meta:
        collection_name = "games"

    player1: str = Field(max_length=20)
    player2: str | None = Field(max_length=20, default=None)

    move_number: int = 1
    board: list[list[int]]
    moves: list[Move] = Field(default_factory=list)
    winner: PlayerEnum | None = None

    finished_at: datetime | None = None

    @computed_field
    def next_player_to_move_username(self) -> str | None:
        return self.player1 if self.move_number % 2 else self.player2

    @property
    def next_player_to_move_sign(self) -> PlayerEnum:
        return (
            PlayerEnum.PLAYER1 if self.move_number % 2 else PlayerEnum.PLAYER2
        )


class MoveInput(BaseModel):
    player: str
    col: NonNegativeInt


def get_model_safe(
    model: type[BaseModel], model_data: dict[str, Any]
) -> BaseModel | None:
    try:
        return model(**model_data)
    except ValidationError:
        return None
