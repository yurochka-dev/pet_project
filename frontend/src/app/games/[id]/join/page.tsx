"use client";

import {
    getPlayerNameFromLocalStorage,
    setPlayerNameInLocalStorage,
} from "@/utils/localStorageUtils";
import { useEffect, useState } from "react";

import { BACKEND_API_BASE_URL } from "@/constants";
import { GameData } from "@/app/games/[id]/page";
import { PetProjectButton } from "@/components/buttons";
import { PlayerNameInput } from "@/components/input";
import { useRouter } from "next/navigation";

export default function JoinGame({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [playerName, setPlayerName] = useState("");

    useEffect(() => {
        fetch(`${BACKEND_API_BASE_URL}/games/${params.id}/`)
            .then((response) => {
                if (!response.ok) throw new Error();
                return response.json();
            })
            .then((data) => {
                const savedPlayerName = getPlayerNameFromLocalStorage(data.id);
                if (data.player2 || savedPlayerName) {
                    router.push(`/games/${data.id}`);
                }
                setGameData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.log("Something went wrong", err);
            });
    }, []);

    if (isLoading) return <div className="text-black">loading...</div>;

    function handleJoinGame() {
        const data = { player: playerName };
        fetch(`${BACKEND_API_BASE_URL}/games/${params.id}/join/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
            .then((response) => {
                if (!response.ok) throw new Error();
                return response.json();
            })
            .then((data) => {
                setPlayerNameInLocalStorage(data.id, playerName);
                router.push(`/games/${data.id}`);
            })
            .catch((err) => {
                console.log("Something went wrong", err);
            });
    }

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="text-center text-gray-600 dark:text-slate-200 sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-2xl font-bold leading-9 tracking-tight ">
                    Join Game
                </h2>
                <h6 className="mt-1 text-lg leading-9 tracking-tight">
                    <span className="text-cyan-500 dark:text-purple-400">
                        {gameData?.player1}{" "}
                    </span>
                    challenged your skills in Connect4.
                </h6>
                <p className="text-md mt-2">
                    Please enter your name and click &quot;Join Game&quot; to start the battle.
                </p>
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm space-y-6">
                <PlayerNameInput
                    label="Your name"
                    value={playerName}
                    setValue={setPlayerName}
                />
                <PetProjectButton label="Join Game" onClickHandler={handleJoinGame} />
            </div>
        </div>
    );
}
