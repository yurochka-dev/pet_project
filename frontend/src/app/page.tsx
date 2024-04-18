"use client";

import { BACKEND_API_BASE_URL } from "@/constants";
import { PetProjectButton } from "@/components/buttons";
import { PlayerNameInput } from "@/components/input";
import { setPlayerNameInLocalStorage } from "@/utils/localStorageUtils";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StartGame() {
    const router = useRouter();
    const [playerName, setPlayerName] = useState("");

    function handleStartGame() {
        const data = { player: playerName };
        fetch(`${BACKEND_API_BASE_URL}/games/`, {
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
            <h2 className="text-center mt-10 text-2xl font-bold leading-9 tracking-tight text-gray-600 dark:text-slate-200">
                New Game
            </h2>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm space-y-6">
                <PlayerNameInput
                    label="Your name"
                    value={playerName}
                    setValue={setPlayerName}
                />
                <PetProjectButton label="Start Game" onClickHandler={handleStartGame} />
            </div>
        </div>
    );
}
