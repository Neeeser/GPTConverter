// src/types/types.ts

export interface HistoryItemProps {
    unit1?: string;
    unit2?: string;
    prompt?: string;
    model?: string;
    pageLink: string;
    isActive,
    setActiveBubbleId,
    applyToPromptDisabled, // Add this prop
    onAppendToPrompt?: (content: string) => void;
    addToPrompt: boolean;
    setAddToPrompt: React.Dispatch<React.SetStateAction<boolean>>;
    timestamp: number; // Unix timestamp
}
