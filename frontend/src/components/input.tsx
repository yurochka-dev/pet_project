interface PlayerNameInputProps {
    label: string;
    value: string;
    setValue: (value: string) => void;
}

export function PlayerNameInput({
    label,
    value,
    setValue,
}: PlayerNameInputProps) {
    return (
        <div>
            <label
                htmlFor="playerName"
                className="block text-sm font-medium leading-6 text-gray-500 dark:text-slate-300"
            >
                {label}
            </label>
            <div className="mt-2">
                <input
                    id="playerName"
                    name="playerName"
                    type="text"
                    required={true}
                    placeholder="Name"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className={`
                        w-full rounded-lg border-0
                        py-1.5 px-2
                        shadow-sm ring-1 ring-inset
                        focus:ring-2 focus:ring-inset
                        sm:text-sm sm:leading-6
                        text-gray-500 placeholder:text-gray-300 ring-gray-200 focus:ring-gray-300
                        dark:bg-slate-800 dark:text-slate-300 dark:placeholder:text-slate-600 dark:ring-slate-600 dark:focus:ring-slate-500
                    `}
                />
            </div>
        </div>
    );
}
