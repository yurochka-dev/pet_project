from datetime import datetime, timezone
from typing import cast

from ..constants import M, N, PlayerEnum
from ..core import calculate_row_by_col, detect_winner, mark_winner
from .models import Game, Move


def make_move(game: Game, col: int) -> None:
    # make move
    row = calculate_row_by_col(game.board, col)
    move_value = game.next_player_to_move_sign
    game.board[row][col] = move_value  # type: ignore[index]
    move = Move(row=cast(int, row), col=col, val=move_value)
    game.moves.append(move)
    game.move_number += 1

    # handle winner
    winner = detect_winner(game.board)
    if winner:
        mark_winner(game.board, winner)
        game.winner = PlayerEnum(winner)
        game.finished_at = datetime.now(timezone.utc)
    elif game.move_number == N * M + 1:  # draw
        game.winner = None
        game.finished_at = datetime.now(timezone.utc)
