interface PetProjectButtonProps {
    label: string;
    onClickHandler: () => void;
}

export function PetProjectButton({ label, onClickHandler }: PetProjectButtonProps) {
    return (
        <button
            onClick={onClickHandler}
            className={`
                w-full rounded-lg
                px-3 py-1.5
                text-sm font-semibold leading-6 text-white
                shadow-sm
                bg-cyan-600 hover:bg-cyan-500
                dark:bg-violet-600 dark:hover:bg-violet-500
            `}
        >
            {label}
        </button>
    );
}
