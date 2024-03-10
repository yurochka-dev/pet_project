class CustomError(Exception):
    """Base class for custom exceptions"""

    default_message = "Unhandled exception"

    def __init__(self, message: str | None = None):
        super().__init__(message or self.default_message)


class GameNotFoundError(CustomError):
    default_message = "Game not found"


class NotAllPlayersJoinedError(CustomError):
    default_message = "Not all players joined"


class GameFinishedError(CustomError):
    default_message = "Game finished"


class MoveNotValidError(CustomError):
    default_message = "Move not valid"


class WrongPlayerToMoveError(CustomError):
    default_message = "Wrong player to move"
