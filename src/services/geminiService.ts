import type { GeminiHistoryItem } from '../types';

export const callAIProxy = async (history: GeminiHistoryItem[], systemInstruction: string): Promise<{ text: string }> => {
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ history, systemInstruction }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch from AI proxy' }));
        throw new Error(error.error || 'An unknown error occurred with the AI proxy.');
    }
    return response.json();
};

export const generateGenericTextViaProxy = async (prompt: string): Promise<string> => {
    const response = await fetch('/api/generate-text', {
         method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch from generic text proxy' }));
        throw new Error(error.error || 'An unknown error occurred with the generic AI proxy.');
    }
    const result = await response.json();
    return result.text;
};