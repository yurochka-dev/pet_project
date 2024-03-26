"use client";

import { BACKEND_API_BASE_URL, BACKEND_WS_BASE_URL } from "@/constants";
import { useEffect, useState } from "react";

export interface GameData {
    id: string;
    player1: string;
    player2: string | null;
    move_number: number;
    board: number[][];
    winner: number | null;
    finished_at: string | null;
}


export default function PlayGame({ params }: { params: { id: string } }) {
    const [data, setData] = useState<GameData | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [ws, setWs] = useState<WebSocket | null>(null);

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
    if (!data) return <div className="text-black">no data</div>;
    if (!data.player2) return <WaitingPlayerToJoin id={params.id} />;

    return (
        <div
            className={`
            flex flex-1 flex-col min-h-full
            py-4
            px-8 md:px-10
            w-full sm:w-9/12
            mx-auto
        `}
        >
            <GameInfo gameData={data} />
            <GameBoard gameData={data} ws={ws} />
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
                    w-full sm:w-5/6
                    mx-auto
                    px-2 py-12
                    text-center
                    shadow-lg rounded-xl
                    border-2
                    bg-cyan-600
                    text-slate-100
                    border-cyan-600
                    shadow-cyan-500

                `}
            >
                <p className="text-xl font-bold">Waiting for player to join</p>
                <div className="relative mt-4">
                    Share this link with a friend to join (click to copy): <br />
                    <span
                        className={`cursor-pointer hover:underline `}
                        onClick={handleLinkClick}
                    >
                        {link_to_share}
                    </span>
                    <span
                        className={`
                            absolute left-1/2 transform -translate-x-1/2 top-14
                            rounded-md bg-cyan-500 text-slate-100 px-2 py-1
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

function GameInfo({ gameData }: { gameData: GameData }) {
    let humanFinishedAt = null;
    if (gameData.finished_at) {
        humanFinishedAt = new Date(gameData.finished_at).toLocaleString();
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
                text-md tracking-tight
            `}
        >
            <p className="text-xl font-bold mb-1">Connect4 BATTLE</p>
            <p className="text-lg font-bold ">
                Game:
                <span className="text-red-400"> {gameData.player1}</span> vs
                <span className="text-yellow-400 drop-shadow-2xl">
                    {" "}
                    {gameData.player2}
                </span>
            </p>
            {humanFinishedAt && <p> Game finished at {humanFinishedAt}</p>}
            {!humanFinishedAt && <p> Move #{gameData.move_number} </p>}
        </div>
    );
}

function GameBoard({gameData, ws}: {gameData: GameData; ws: WebSocket | null}) {
    const handleCellClick = (i: number, j: number) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            const payload = {
                player: gameData.move_number % 2 ? gameData.player1 : gameData.player2, // TODO - set player name
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
}: {
    rowIndex: number;
    colIndex: number;
    cellValue: number;
    handleCellClick: (i: number, j: number) => void;
}) {
    return (
        <td key={`cell-${rowIndex}-${colIndex}`}>
            <button
                className={`
                    h-10 w-10 sm:h-12 sm:w-12
                    rounded-full border-2 transition duration-200 border-cyan-100
                    ${cellValue === 1
                        ? "bg-red-400"
                        : cellValue === 2
                            ? "bg-yellow-300"
                            : cellValue == 3
                                ? "bg-green-400"
                                : ""
                    }
                `}
                onClick={() => handleCellClick(rowIndex, colIndex)}
            ></button>
        </td>
    );
}
