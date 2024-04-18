"use client";

import { BACKEND_API_BASE_URL, BACKEND_WS_BASE_URL } from "@/constants";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { PetProjectButton } from "@/components/buttons";
import { getPlayerNameFromLocalStorage } from "@/utils/localStorageUtils";

interface MoveData {
    row: number;
    col: number;
    val: number;
}

export interface GameData {
    id: string;
    player1: string;
    player2: string | null;
    move_number: number;
    board: number[][];
    moves: MoveData[];
    winner: number | null;
    next_player_to_move_username: string;
    finished_at: string | null;
}


export default function PlayGame({ params }: { params: { id: string } }) {
    const [data, setData] = useState<GameData | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [ws, setWs] = useState<WebSocket | null>(null);

    const playerName = getPlayerNameFromLocalStorage(params.id);

    useEffect(() => {
        const ws = new WebSocket(`${BACKEND_WS_BASE_URL}/games/ws/${params.id}/`);
        ws.addEventListener("open", () => {
            fetch(`${BACKEND_API_BASE_URL}/games/${params.id}/`)
                .then((response) => {
                    if (!response.ok) throw new Error();
                    return response.json();
                })
                .then((data) => {
                    setData(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.log("Something went wrong", err);
                });
        });
        ws.addEventListener("message", (event) => {
            const data = JSON.parse(JSON.parse(event.data));
            setData(data);
        });
        setWs(ws);

        // clean up WS connection when the component is unmounted
        return () => {
            ws.close();
        };
    }, []);

    if (isLoading) return <div className="text-black">loading...</div>;
    if (!data || !playerName) return <div className="text-black">no data</div>;
    if (!data.player2) return <WaitingPlayerToJoin id={params.id} />;

    return (
        <div
            className={`
            flex flex-1 flex-col min-h-full
            py-4
            px-8 md:px-10 lg:px-16 xl:px-18 3xl:px-12 4xl:px-32
            w-full sm:w-9/12 md:w-9/12 lg:w-7/12 xl:w-6/12 2xl:w-5/12 3xl:w-5/12 4xl:w-5/12
            mx-auto
        `}
        >
            <GameInfo gameData={data} setGameData={setData} playerName={playerName} />
            <GameBoard gameData={data} playerName={playerName} ws={ws} />
        </div>
    );
}

function WaitingPlayerToJoin({ id }: { id: string }) {
    const [isCopied, setIsCopied] = useState(false);

    const frontend_base_url =
        window.location.protocol + "//" + window.location.host;
    const link_to_share = `${frontend_base_url}/games/${id}/join/`;

    const handleLinkClick = () => {
        navigator.clipboard.writeText(link_to_share);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1000);
    };

    return (
        <div className="flex flex-1 flex-col justify-center min-h-full mx-4">
            <div
                className={`
                    w-full sm:w-5/6 md:w-3/4 lg:w-3/5 xl:w-6/12 3xl:w-1/3
                    mx-auto
                    px-2 py-12
                    text-center
                    shadow-lg rounded-xl
                    border-2
                    bg-cyan-600
                    text-slate-100
                    border-cyan-600
                    shadow-cyan-500
                    dark:bg-inherit
                    dark:text-blue-100
                    dark:border-blue-500
                    dark:shadow-2xl
                    dark:shadow-blue-600
                `}
            >
                <p className="text-xl font-bold">Waiting for player to join</p>
                <div className="relative mt-4">
                    Share this link with a friend to join (click to copy): <br />
                    <span
                        className={`cursor-pointer hover:underline dark:text-blue-400 dark:hover:text-blue-300`}
                        onClick={handleLinkClick}
                    >
                        {link_to_share}
                    </span>
                    <span
                        className={`
                            absolute left-1/2 transform -translate-x-1/2 top-14
                            rounded-md bg-cyan-500 text-slate-100 dark:bg-blue-500 dark:text-blue-100 px-2 py-1Ω
                            text-xs transition-opacity duration-500
                            ${isCopied ? "opacity-100" : "opacity-0"}
                        `}
                    >
                        Copied!
                    </span>
                </div>
            </div>
        </div>
    );
}

function GameInfo({ gameData, setGameData, playerName, }: { gameData: GameData, setGameData: Dispatch<SetStateAction<GameData | null>>; playerName: string; }) {
    const [replayInProgress, setReplayInProgress] = useState(false);

    const handleReplayGame = () => {
        if (replayInProgress || !gameData.moves) {
            return;
        }
        setReplayInProgress(true);

        // init empty 6x7 board
        const N = 6;
        const M = 7;
        let newBoard = Array.from({ length: N }, () => Array(M).fill(0));
        const finalBoard = gameData.board;

        // set empty
        setGameData({ ...gameData, board: newBoard, move_number: 0 });

        // update board move by move
        setTimeout(() => {
            gameData.moves.forEach((move: MoveData, i: number) => {
                setTimeout(() => {
                    setGameData((prevState: GameData | null) => {
                        if (!prevState) return prevState;

                        newBoard[move.row][move.col] = move.val;
                        if (i == gameData.moves.length - 1) {
                            setReplayInProgress(false);
                            return { ...prevState, board: finalBoard, move_number: i + 1 };
                        }
                        return { ...prevState, board: newBoard, move_number: i + 1 };
                    });
                }, i * 500);
            });
        }, 500);
    };

    let gameStatus = "";
    let humanFinishedAt = null;
    if (gameData.finished_at) {
        humanFinishedAt = new Date(gameData.finished_at).toLocaleString();
        if (!gameData.winner) {
            gameStatus += "It's a draw";
        } else if (
            (gameData.winner == 1 && gameData.player1 == playerName) ||
            (gameData.winner == 2 && gameData.player2 == playerName)
        ) {
            gameStatus += "You won!";
        } else {
            gameStatus += "You lost!"
        }
    } else if (gameData.next_player_to_move_username == playerName) {
        gameStatus = "It's your turn";
    } else {
        gameStatus = `It's ${gameData.next_player_to_move_username}'s turn`;
    }

    return (
        <div
            className={`
                py-4
                px-5 rounded-xl
                text-center
                shadow-lg
                border-2
                bg-slate-200
                text-cyan-800
                border-cyan-300
                shadow-cyan-500
                dark:bg-violet-950
                dark:text-violet-100
                dark:border-violet-500
                dark:shadow-violet-500
                text-md 3xl:text-lg tracking-tight
            `}
        >
            <p className="text-xl 3xl:text-2xl font-bold mb-1">Connect4 BATTLE</p>
            <p className="text-lg 3xl:text-xl font-bold ">
                Game:
                <span className="text-red-400 dark:text-purple-400"> {gameData.player1}</span> vs
                <span className="text-yellow-400 dark:text-blue-500 drop-shadow-2xl"> {gameData.player2}</span>
            </p>
            <p>{gameStatus}</p>
            {humanFinishedAt && <p> Game finished at {humanFinishedAt}</p>}
            {(!humanFinishedAt || replayInProgress) && <p> Move #{gameData.move_number} </p>}
            {humanFinishedAt && (
                <div className="mx-auto mt-2 w-1/2 sm:w-1/3">
                    <PetProjectButton
                        label="Replay Game"
                        onClickHandler={handleReplayGame}
                    />
                </div>
            )}
        </div>
    );
}

function GameBoard({gameData, playerName, ws}: {gameData: GameData; playerName: string; ws: WebSocket | null}) {
    const [highlightedColumn, setHighlightedColumn] = useState<number | null>(
        null,
    );

    const handleColumnHover = (colIndex: number) => {
        setHighlightedColumn(colIndex);
    };
    const handleColumnLeave = () => {
        setHighlightedColumn(null);
    };

    const handleCellClick = (i: number, j: number) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            const payload = {
                player: playerName,
                col: j,
            };
            ws.send(JSON.stringify(payload));
        }
    };

    return (
        <div
            className={`
                mt-4 rounded-xl
                p-5 shadow-2xl
                bg-cyan-600
                shadow-cyan-700
                border-2
                border-cyan-600
                dark:bg-inherit
                dark:shadow-blue-600
                dark:border-2
                dark:border-blue-600
            `}
        >
            <table className="mx-auto my-0 sm:my-2">
                <tbody>
                    {gameData.board.map((row: number[], rowIndex: number) => (
                        <tr key={`row-${rowIndex}`}>
                            {row.map((cell: number, colIndex: number) => (
                                <GameBoardCell
                                    key={`${rowIndex}-${colIndex}`}
                                    rowIndex={rowIndex}
                                    colIndex={colIndex}
                                    cellValue={cell}
                                    handleCellClick={handleCellClick}
                                    playerName={playerName}
                                    gameData={gameData}
                                    highlightedColumn={highlightedColumn}
                                    handleColumnHover={handleColumnHover}
                                    handleColumnLeave={handleColumnLeave}
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function GameBoardCell({
    rowIndex,
    colIndex,
    cellValue,
    handleCellClick,
    playerName,
    gameData,
    highlightedColumn,
    handleColumnHover,
    handleColumnLeave,
}: {
    rowIndex: number;
    colIndex: number;
    cellValue: number;
    handleCellClick: (i: number, j: number) => void;
    playerName: string;
    gameData: GameData;
    highlightedColumn: number | null;
    handleColumnHover: (colIndex: number) => void;
    handleColumnLeave: () => void;
}) {
    // highlight cell logic
    let toHighlight = false;
    if (gameData.board[rowIndex][colIndex] == 0 && !gameData.finished_at &&
        gameData.next_player_to_move_username == playerName &&
        highlightedColumn === colIndex
    ) {
        toHighlight = true;
    }

    return (
        <td
            key={`cell-${rowIndex}-${colIndex}`}
            onMouseEnter={() => handleColumnHover(colIndex)}
            onMouseLeave={handleColumnLeave}
        >
            <button
                className={`
                    h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-14 lg:w-14 xl:h-16 xl:w-16 3xl:h-20 3xl:w-20
                    rounded-full border-2 transition duration-200 border-cyan-100 dark:border-violet-300
                    ${cellValue === 1
                        ? "bg-red-400 dark:bg-purple-500"
                        : cellValue === 2
                            ? "bg-yellow-300 dark:bg-blue-600"
                            : cellValue == 3
                                ? "bg-green-400 dark:bg-green-600"
                                : ""
                    }
                    ${toHighlight ? "bg-cyan-500 dark:bg-slate-800" : "cursor-default"}
                `}
                onClick={() => handleCellClick(rowIndex, colIndex)}
            ></button>
        </td>
    );
}
