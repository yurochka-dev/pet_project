from ..core import calculate_row_by_col, is_valid_move
from .exceptions import (
    CustomError,
    GameFinishedError,
    GameNotFoundError,
    MoveNotValidError,
    NotAllPlayersJoinedError,
    WrongPlayerToMoveError,
)
from .models import Game, MoveInput


def validate(game: Game | None, move: MoveInput | None) -> str | None:
    try:
        validate_game(game)
        validate_move(game, move)  # type: ignore[arg-type]
    except CustomError as err:
        return str(err)
    return None


def validate_game(game: Game | None) -> None:
    if game is None:
        raise GameNotFoundError()

    if game.player2 is None:
        raise NotAllPlayersJoinedError()

    if game.finished_at:
        raise GameFinishedError()


def validate_move(game: Game, move: MoveInput | None) -> None:
    if move is None:
        raise MoveNotValidError()

    if move.player != game.next_player_to_move_username:
        raise WrongPlayerToMoveError()

    row = calculate_row_by_col(game.board, move.col)
    if not is_valid_move(game.board, row, move.col):
        raise MoveNotValidError()
