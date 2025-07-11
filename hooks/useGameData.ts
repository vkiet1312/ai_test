

import React, { useState, useEffect, useCallback } from 'react';
import { GameSettings, StoryItem, KnowledgeBase, SavedGame, ModalMessage, ConfirmationModalState, SuggestionsModalState, Memory, WorldKnowledgeRule, QuickLoreItem, Quest, GeminiHistoryItem } from '../types';
import { PLAYER_PERSONALITIES } from '../constants';
import { callAIProxy, generateGenericTextViaProxy } from '../services/geminiService';

const SAVED_GAMES_KEY = 'ai-rpg-saved-games-v2';

const parseKeyValueString = (kvString: string): Record<string, any> => {
    const result: Record<string, any> = {};
    const pairRegex = /([\w\u00C0-\u017F\s]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([\w\u00C0-\u017F\s\d.:\/+\-_%À-ỹ]+?(?=\s*,\s*[\w\u00C0-\u017F\s]+\s*=|$)))/gu;
    let match;
    while ((match = pairRegex.exec(kvString)) !== null) {
        const key = match[1].trim();
        let value = match[2] || match[3] || match[4];
        if (value !== undefined) {
            const trimmedValue = value.trim();
            if (trimmedValue.toLowerCase() === 'true') result[key] = true;
            else if (trimmedValue.toLowerCase() === 'false') result[key] = false;
            else if (/^\d+(\.\d+)?$/.test(trimmedValue) && !isNaN(parseFloat(trimmedValue))) result[key] = parseFloat(trimmedValue);
            else result[key] = trimmedValue;
        }
    }
    return result;
}


export const useGameData = () => {
    const [currentScreen, setCurrentScreen] = useState('initial');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Game State
    const [gameSettings, setGameSettings] = useState<GameSettings>({
        theme: '', setting: '', characterName: '', characterPersonality: PLAYER_PERSONALITIES[0],
        customPersonality: '', characterGender: 'Không xác định', characterBackstory: '', preferredInitialSkill: '',
        difficulty: 'Thường', difficultyDescription: '', allowNsfw: false,
        initialWorldElements: [], useCharacterGoal: false, characterGoal: '',
        allowCustomActionInput: true, narrationStyle: 'Góc nhìn thứ ba (Mặc định)',
    });
    const [storyHistory, setStoryHistory] = useState<StoryItem[]>([]);
    const [geminiHistory, setGeminiHistory] = useState<GeminiHistoryItem[]>([]);
    const [systemInstruction, setSystemInstruction] = useState('');
    const [currentStory, setCurrentStory] = useState('');
    const [choices, setChoices] = useState<string[]>([]);
    const [customActionInput, setCustomActionInput] = useState('');
    const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase>({
        npcs: [], items: [], locations: [], companions: [],
        inventory: [], playerSkills: [], relationships: [],
        playerStatus: [], quests: [],
    });
    const [memories, setMemories] = useState<Memory[]>([]);
    const [worldKnowledge, setWorldKnowledge] = useState<WorldKnowledgeRule[]>([]);
    
    // Save/Load State
    const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
    const [currentGameId, setCurrentGameId] = useState<string | null>(null);

    // Modal States
    const [showUpdateLogModal, setShowUpdateLogModal] = useState(false);
    const [showLoadGameModal, setShowLoadGameModal] = useState(false);
    const [showCharacterInfoModal, setShowCharacterInfoModal] = useState(false);
    const [showQuickLoreModal, setShowQuickLoreModal] = useState(false);
    const [showMemoryModal, setShowMemoryModal] = useState(false);
    const [showWorldKnowledgeModal, setShowWorldKnowledgeModal] = useState(false);
    const [modalMessage, setModalMessage] = useState<ModalMessage>({ show: false, title: '', content: '', type: 'info' });
    const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>({ show: false, title: '', content: '', onConfirm: () => {}, confirmText: 'Xác nhận', cancelText: 'Hủy' });
    const [showSuggestionsModal, setShowSuggestionsModal] = useState<SuggestionsModalState>({ show: false, fieldType: null, suggestions: [], isLoading: false, title: '' });
    const [quickLoreContent, setQuickLoreContent] = useState<QuickLoreItem | null>(null);

    // Async Operation States
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
    const [isGeneratingContent, setIsGeneratingContent] = useState(false);
    const [isGeneratingDifficultyDesc, setIsGeneratingDifficultyDesc] = useState(false);
    const [isGeneratingInitialElementDesc, setIsGeneratingInitialElementDesc] = useState<Record<string, boolean>>({});
    const [isGeneratingGoal, setIsGeneratingGoal] = useState(false);
    const [isGeneratingCharacterName, setIsGeneratingCharacterName] = useState(false);
    const [isGeneratingInitialSkill, setIsGeneratingInitialSkill] = useState(false);
    const [isGeneratingSuggestedActions, setIsGeneratingSuggestedActions] = useState(false);

    useEffect(() => {
        try {
            const localData = localStorage.getItem(SAVED_GAMES_KEY);
            if (localData) {
                const games: SavedGame[] = JSON.parse(localData);
                setSavedGames(games.sort((a, b) => b.updatedAt - a.updatedAt));
            }
        } catch (error) {
            console.error("Failed to load saved games from localStorage", error);
            setModalMessage({ show: true, title: 'Lỗi Tải Game', content: 'Không thể đọc dữ liệu game đã lưu.', type: 'error' });
        }
    }, []);

    const saveGameProgress = useCallback(() => {
        if (!currentGameId || storyHistory.length === 0) return;
        setIsSaving(true);
        try {
            const gameState: SavedGame = {
                id: currentGameId,
                settings: gameSettings,
                storyHistory,
                geminiHistory,
                knowledgeBase,
                memories,
                worldKnowledge,
                systemInstruction,
                updatedAt: Date.now(),
            };
            const otherGames = savedGames.filter(g => g.id !== currentGameId);
            const updatedGames = [...otherGames, gameState];
            localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(updatedGames));
            setSavedGames(updatedGames.sort((a, b) => b.updatedAt - a.updatedAt));
        } catch (error) {
            console.error("Error saving game progress to localStorage:", error);
            setModalMessage({ show: true, title: 'Lỗi Lưu Game', content: 'Không thể lưu tiến trình game.', type: 'error' });
        } finally {
            setTimeout(() => setIsSaving(false), 1000);
        }
    }, [currentGameId, gameSettings, storyHistory, geminiHistory, knowledgeBase, memories, worldKnowledge, savedGames, systemInstruction]);

    useEffect(() => {
        if (currentScreen === 'gameplay' && storyHistory.length > 0 && currentGameId) {
            saveGameProgress();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storyHistory]); // Only trigger on story history change

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setGameSettings(prev => {
            const newSettings = { ...prev, [name]: type === 'checkbox' ? checked : value };
            if (name === "difficulty" && value !== "Tuỳ Chỉnh AI") {
                newSettings.difficultyDescription = '';
            }
            if (name === "useCharacterGoal" && !checked) {
                newSettings.characterGoal = '';
            }
            if (name === "characterPersonality" && value !== "Tùy Chọn") {
                newSettings.customPersonality = '';
            }
            return newSettings;
        });
    }, []);

    const openQuickLoreModal = useCallback((item: any, category: string) => {
        if (item) {
            setQuickLoreContent({ ...item, category: category.toLowerCase() });
            setShowQuickLoreModal(true);
        } else {
            setModalMessage({ show: true, title: "Lỗi Hiển Thị", content: "Không thể hiển thị thông tin chi tiết.", type: 'error' });
        }
    }, []);

    const formatStoryText = useCallback((text: string): React.ReactNode => {
        if (!text) return null;
    
        const processLine = (lineContent: string) => {
            let segments: { type: 'text' | 'lore', content?: string, text?: string, category?: string, originalItem?: any }[] = [{ type: 'text', content: lineContent }];
            const allLoreEntries: { name: string, category: string, originalItem: any }[] = [];
            
            const allLoreCategories = ['companions', 'npcs', 'items', 'locations', 'inventory', 'playerSkills', 'relationships', 'playerStatus', 'quests'];
            allLoreCategories.forEach(category => {
                (knowledgeBase[category as keyof KnowledgeBase] as any[] || []).forEach(loreItem => {
                    const itemName = loreItem.Name || loreItem.name || loreItem.title;
                    if (itemName && itemName.trim() !== "") {
                        allLoreEntries.push({ name: itemName.trim(), category, originalItem: loreItem });
                    }
                });
            });
            allLoreEntries.sort((a, b) => b.name.length - a.name.length);
    
            allLoreEntries.forEach(entry => {
                const { name: loreName, category, originalItem } = entry;
                const newSegments: typeof segments = [];
                segments.forEach(segment => {
                    if (segment.type === 'text' && segment.content) {
                        const regex = new RegExp(`(\\b${loreName.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}\\b)`, 'gi');
                        const parts = segment.content.split(regex);
                        for (let i = 0; i < parts.length; i++) {
                            if (parts[i].toLowerCase() === loreName.toLowerCase()) {
                                newSegments.push({ type: 'lore', text: parts[i], category, originalItem });
                            } else if (parts[i] !== "") {
                                newSegments.push({ type: 'text', content: parts[i] });
                            }
                        }
                    } else {
                        newSegments.push(segment);
                    }
                });
                segments = newSegments;
            });
            
            return segments.map((segment, index) => {
                if (segment.type === 'text' && segment.content) {
                    let formattedSegment = segment.content;
                    formattedSegment = formattedSegment.replace(/^([\w\s\u00C0-\u017F]+):\s*"(.*?)"/gm, `<strong class="text-blue-400">$1:</strong> "$2"`);
                    formattedSegment = formattedSegment.replace(/(?<!\w)\*(.*?)\*(?!\w)/g, '<em class="text-purple-400 italic">"$1"</em>');
                    formattedSegment = formattedSegment.replace(/(?<!\w)_(.*?)_(?!\w)/g, '<em class="text-purple-400 italic">"$1"</em>');
                    formattedSegment = formattedSegment.replace(/\[(?!PLAYER_PERSONALITIES|LORE_|COMPANION|ITEM_AQUIRED|SKILL_LEARNED|RELATIONSHIP_CHANGED|ITEM_CONSUMED|ITEM_UPDATED|STATUS_APPLIED_SELF|STATUS_CURED_SELF|STATUS_EXPIRED_SELF|STATUS_APPLIED_NPC|STATUS_CURED_NPC|STATUS_EXPIRED_NPC|QUEST_ASSIGNED|QUEST_UPDATED|QUEST_OBJECTIVE_COMPLETED)(.*?)\]/g, '<span class="text-yellow-400 font-semibold">[$1]</span>');
                    formattedSegment = formattedSegment.replace(/\*\*(.*?)\*\*/g, '<strong class="text-xl block my-2 text-green-400">$1</strong>');
                    return React.createElement('span', { key: `segment-${index}`, dangerouslySetInnerHTML: { __html: formattedSegment } });
                } else if (segment.type === 'lore' && segment.text && segment.originalItem) {
                    return React.createElement('span', { 
                        key: `lore-${segment.originalItem.id}-${index}`, 
                        className: "text-cyan-400 hover:text-cyan-300 underline cursor-pointer font-semibold", 
                        onClick: (e: React.MouseEvent) => { e.stopPropagation(); openQuickLoreModal(segment.originalItem, segment.category!); }
                    }, segment.text);
                }
                return null;
            });
        };
        return text.split(/\n\s*\n/).map((paragraph, pIndex) => (
            React.createElement('p', { key: `p-${pIndex}`, className: "mb-3 leading-relaxed" },
                paragraph.split('\n').map((line, lineIndex) => (
                    React.createElement(React.Fragment, { key: `line-${lineIndex}` },
                        processLine(line),
                        lineIndex < paragraph.split('\n').length - 1 ? React.createElement('br') : null
                    )
                ))
            )
        ));
    }, [knowledgeBase, openQuickLoreModal]);

    const addMemory = useCallback((memoryContent: string) => {
        if (!memoryContent || memoryContent.trim() === '') return;
        const newMemory: Memory = { 
            id: crypto.randomUUID(), 
            content: memoryContent, 
            pinned: false, 
            timestamp: Date.now() 
        };
    
        setMemories(prevMemories => {
            const updatedMemories = [newMemory, ...prevMemories];
            const MAX_UNPINNED_MEMORIES = 7;
            const pinned = updatedMemories.filter(m => m.pinned);
            const unpinned = updatedMemories.filter(m => !m.pinned);
            const latestUnpinned = unpinned.slice(0, MAX_UNPINNED_MEMORIES);
            return [...pinned, ...latestUnpinned].sort((a, b) => b.timestamp - a.timestamp);
        });
    }, []);

    const parseGeminiResponseAndUpdateState = useCallback(async (text: string) => {
        let storyContent = text;
        let extractedChoices: string[] = [];
    
        const newKnowledgeUpdates: { [key: string]: any[] } = { 
            _removePlayerStatusByName: [], _updateNpcStatus: [], 
            _updateQuest: [], _updateQuestObjective: [],
        };
    
        const tagPatterns: { [key: string]: RegExp } = {
            MEMORY_ADD: /\[MEMORY_ADD:\s*"([^"]+)"\]/gs,
            LORE_NPC: /\[LORE_NPC:\s*([^\]]+)\]/gs, LORE_ITEM: /\[LORE_ITEM:\s*([^\]]+)\]/gs, LORE_LOCATION: /\[LORE_LOCATION:\s*([^\]]+)\]/gs,
            COMPANION: /\[COMPANION:\s*([^\]]+)\]/gs, ITEM_AQUIRED: /\[ITEM_AQUIRED:\s*([^\]]+)\]/gs, SKILL_LEARNED: /\[SKILL_LEARNED:\s*([^\]]+)\]/gs,
            RELATIONSHIP_CHANGED: /\[RELATIONSHIP_CHANGED:\s*([^\]]+)\]/gs, ITEM_CONSUMED: /\[ITEM_CONSUMED:\s*([^\]]+)\]/gs, ITEM_UPDATED: /\[ITEM_UPDATED:\s*([^\]]+)\]/gs,   
            STATUS_APPLIED_SELF: /\[STATUS_APPLIED_SELF:\s*([^\]]+)\]/gs, STATUS_CURED_SELF: /\[STATUS_CURED_SELF:\s*Name="([^"]+)"\]/gs, 
            STATUS_EXPIRED_SELF: /\[STATUS_EXPIRED_SELF:\s*Name="([^"]+)"\]/gs, STATUS_APPLIED_NPC: /\[STATUS_APPLIED_NPC:\s*([^\]]+)\]/gs,
            STATUS_CURED_NPC: /\[STATUS_CURED_NPC:\s*NPCName="([^"]+)",\s*StatusName="([^"]+)"\]/gs, STATUS_EXPIRED_NPC: /\[STATUS_EXPIRED_NPC:\s*NPCName="([^"]+)",\s*StatusName="([^"]+)"\]/gs,
            QUEST_ASSIGNED: /\[QUEST_ASSIGNED:\s*([^\]]+)\]/gs, QUEST_UPDATED: /\[QUEST_UPDATED:\s*([^\]]+)\]/gs, QUEST_OBJECTIVE_COMPLETED: /\[QUEST_OBJECTIVE_COMPLETED:\s*([^\]]+)\]/gs,
        };
    
        const categoryMap: { [key: string]: keyof KnowledgeBase | '' } = {
            LORE_NPC: 'npcs', LORE_ITEM: 'items', LORE_LOCATION: 'locations', COMPANION: 'companions', ITEM_AQUIRED: 'inventory', 
            SKILL_LEARNED: 'playerSkills', RELATIONSHIP_CHANGED: 'relationships', ITEM_CONSUMED: 'inventory', ITEM_UPDATED: 'inventory',
            STATUS_APPLIED_SELF: 'playerStatus', QUEST_ASSIGNED: 'quests',
        };
    
        for (const tagType in tagPatterns) {
            const regex = tagPatterns[tagType];
            storyContent = storyContent.replace(regex, (match, ...args) => {
                try {
                    if (tagType === 'STATUS_CURED_NPC' || tagType === 'STATUS_EXPIRED_NPC') {
                        const [npcName, statusName] = args;
                        if (npcName?.trim() && statusName?.trim()) newKnowledgeUpdates._updateNpcStatus.push({ npcName, removeStatusName: statusName });
                    } else {
                        const p1 = args[0];
                        if (tagType === 'MEMORY_ADD') addMemory(p1);
                        else if (tagType === 'STATUS_CURED_SELF' || tagType === 'STATUS_EXPIRED_SELF') {
                            if (p1?.trim()) newKnowledgeUpdates._removePlayerStatusByName.push(p1.trim());
                        } else {
                            const parsedData = parseKeyValueString(p1);
                            if (tagType === 'STATUS_APPLIED_NPC') {
                                if (parsedData.NPCName?.trim() && parsedData.Name?.trim()) newKnowledgeUpdates._updateNpcStatus.push({ npcName: parsedData.NPCName, status: { id: crypto.randomUUID(), ...parsedData, NPCName: undefined } });
                            } else if (tagType === 'QUEST_UPDATED') {
                                if (parsedData.title?.trim()) newKnowledgeUpdates._updateQuest.push(parsedData);
                            } else if (tagType === 'QUEST_OBJECTIVE_COMPLETED') {
                                if (parsedData.questTitle?.trim() && parsedData.objectiveDescription?.trim()) newKnowledgeUpdates._updateQuestObjective.push(parsedData);
                            } else {
                                const categoryKey = categoryMap[tagType];
                                const primaryKey = parsedData.Name || parsedData.name || parsedData.title;
                                if (categoryKey && primaryKey?.trim()) {
                                    const itemWithId: any = { id: crypto.randomUUID(), ...parsedData, name: primaryKey };
                                    if (categoryKey === 'quests') {
                                        itemWithId.objectives = parsedData.objectives ? parsedData.objectives.split(';').map((t: string) => ({ text: t.trim(), completed: false })) : [];
                                        itemWithId.status = parsedData.status || 'active';
                                    }
                                    if (!newKnowledgeUpdates[categoryKey]) newKnowledgeUpdates[categoryKey] = [];
                                    newKnowledgeUpdates[categoryKey].push(itemWithId);
                                }
                            }
                        }
                    }
                } catch (e) { console.error(`Error parsing ${tagType}:`, match, e); }
                return "";
            });
        }
    
        setKnowledgeBase(prev => {
            const updatedKnowledge: KnowledgeBase = JSON.parse(JSON.stringify(prev));
            Object.keys(newKnowledgeUpdates).forEach(key => {
                if (key.startsWith('_')) return;
                const categoryKey = key as keyof KnowledgeBase;
                if (!updatedKnowledge[categoryKey]) (updatedKnowledge as any)[categoryKey] = [];
                newKnowledgeUpdates[key].forEach(newItem => {
                    const uniqueKey = newItem.Name || newItem.name || newItem.title;
                    const index = (updatedKnowledge[categoryKey] as any[]).findIndex(item => (item.Name || item.name || item.title)?.toLowerCase() === uniqueKey.toLowerCase());
                    if (index > -1) (updatedKnowledge[categoryKey] as any[])[index] = { ...(updatedKnowledge[categoryKey] as any[])[index], ...newItem };
                    else (updatedKnowledge[categoryKey] as any[]).push(newItem);
                });
            });
    
            newKnowledgeUpdates._removePlayerStatusByName.forEach(name => {
                updatedKnowledge.playerStatus = updatedKnowledge.playerStatus.filter(s => s.name !== name);
            });
            newKnowledgeUpdates._updateQuest.forEach(update => {
                const quest = updatedKnowledge.quests.find(q => q.title === update.title);
                if (quest) quest.status = update.status;
            });
            newKnowledgeUpdates._updateQuestObjective.forEach(update => {
                const quest = updatedKnowledge.quests.find(q => q.title === update.questTitle);
                if (quest) {
                    const obj = quest.objectives.find(o => o.text === update.objectiveDescription);
                    if (obj) obj.completed = true;
                }
            });
    
            return updatedKnowledge;
        });
    
        const lines = storyContent.split('\n');
        let lastFoundChoiceIndex = -1;
    
        for (let i = lines.length - 1; i >= 0; i--) {
            const trimmedLine = lines[i].trim();
            if (trimmedLine.match(/^\d+\.\s/)) {
                lastFoundChoiceIndex = i;
            } else if (trimmedLine !== '') {
                // This is a non-empty, non-choice line. We stop searching.
                break;
            }
            // If the line is empty, we continue up.
        }
        
        if (lastFoundChoiceIndex !== -1) {
            const choiceBlockStartIndex = lastFoundChoiceIndex;
            const choiceLines = lines.slice(choiceBlockStartIndex);
            storyContent = lines.slice(0, choiceBlockStartIndex).join('\n').trim();
            extractedChoices = choiceLines.join('\n').split(/^\d+\.\s/m).map(c => c.trim()).filter(Boolean);
        }
        
        return { story: storyContent.trim(), choices: extractedChoices };
    }, [addMemory]);
    
    const callAndProcessAI = async (newUserMessage: string, currentSystemInstruction: string) => {
        setIsLoading(true);
        const newHistoryEntry: GeminiHistoryItem = { role: 'user', parts: [{ text: newUserMessage }] };
        const updatedHistory = [...geminiHistory, newHistoryEntry];
    
        try {
            const response = await callAIProxy(updatedHistory, currentSystemInstruction);
            const rawText = response.text;
            const { story, choices: newChoices } = await parseGeminiResponseAndUpdateState(rawText);
    
            setGeminiHistory([...updatedHistory, { role: 'model', parts: [{ text: rawText }] }]);
            setCurrentStory(story);
            setChoices(newChoices);
            setStoryHistory(prev => [...prev, { type: 'story', content: story }]);
        } catch (error: any) {
            console.error('Error in callAndProcessAI:', error);
            const errorMessage = error.message || "Đã xảy ra lỗi không xác định khi giao tiếp với AI.";
            setStoryHistory(prev => [...prev, { type: 'system', content: errorMessage }]);
            setModalMessage({ show: true, title: 'Lỗi AI', content: errorMessage, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const performRestart = () => { 
        setCurrentGameId(null); 
        setGameSettings({
            theme: '', setting: '', characterName: '', characterPersonality: PLAYER_PERSONALITIES[0], customPersonality: '',
            characterGender: 'Không xác định', characterBackstory: '', preferredInitialSkill: '', difficulty: 'Thường',
            difficultyDescription: '', allowNsfw: false, initialWorldElements: [], useCharacterGoal: false,
            characterGoal: '', allowCustomActionInput: true, narrationStyle: 'Góc nhìn thứ ba (Mặc định)'
        });
        setCurrentStory(''); setChoices([]); setStoryHistory([]); setGeminiHistory([]);
        setKnowledgeBase({ npcs: [], items: [], locations: [], companions: [], inventory: [], playerSkills: [], relationships: [], playerStatus: [], quests: [] });
        setMemories([]);
        setWorldKnowledge([]);
        setCustomActionInput(''); 
        setCurrentScreen('setup'); 
    };
    
    const goHome = () => {
        if (currentScreen === 'gameplay' && storyHistory.length > 0) {
            setConfirmationModal({
                show: true, title: 'Về Trang Chủ?', content: 'Lưu tiến trình game trước khi về trang chủ?',
                onConfirm: () => {
                    if (currentGameId) saveGameProgress();
                    setCurrentScreen('initial');
                },
                onCancel: () => setCurrentScreen('initial'),
                confirmText: 'Lưu và Về Home', cancelText: 'Về Home (Không lưu)'
            });
        } else {
            setCurrentScreen('initial');
        }
    };
    
    const initializeGame = async () => {
        if (!gameSettings.theme || !gameSettings.setting || !gameSettings.characterName || !gameSettings.characterBackstory) {
            setModalMessage({ show: true, title: 'Thiếu Thông Tin', content: 'Vui lòng điền đủ Chủ đề, Bối cảnh, Tên và Tiểu sử.', type: 'error' }); return;
        }
        if (gameSettings.characterPersonality === "Tùy Chọn" && !gameSettings.customPersonality.trim()) {
            setModalMessage({ show: true, title: 'Thiếu Thông Tin', content: 'Vui lòng nhập tính cách tùy chỉnh của bạn.', type: 'error' }); return;
        }
    
        setCurrentStory(''); setChoices([]); setStoryHistory([]); setGeminiHistory([]);
        setKnowledgeBase({ npcs: [], items: [], locations: [], companions: [], inventory: [], playerSkills: [], relationships: [], playerStatus: [], quests: [] }); 
        setMemories([]);
        setWorldKnowledge([]);
        setCurrentGameId(crypto.randomUUID());
        
        const initialWorldElementsString = gameSettings.initialWorldElements.map(el => `- Loại: ${el.type}, Tên: ${el.name}, Mô tả: ${el.description}`).join('\n');
        const nsfwInstruction = gameSettings.allowNsfw ? 'ĐÃ BẬT. Bạn ĐƯỢC PHÉP và ĐƯỢC KHUYẾN KHÍCH mô tả các cảnh 18+ với phong cách truyện 18+ , các đại từ chỉ bộ phận sinh dục sẽ được ẩn dụ thành cu tức là dương vật và lồn tức là âm đạo và dú tức là vú, ngoài ra đa dạng sử dụng ngôn từ biểu thị bộ phận sinh dục sao cho hấp dẫn và tự nhiên nhất, như dương vật, cặc, đầu khấc, hòn dái, bi, âm vật, lỗ đít, lỗ hậu, tử cung, bầu ngực..., và cảnh quan hệ được nói một cách nghệ thuật, các cảnh máu me giết chóc cũng sẽ nói trực diện.' : 'ĐÃ TẮT. Tránh xa các chủ đề nhạy cảm.';
        const narrationInstruction = gameSettings.narrationStyle === 'Góc nhìn thứ nhất (Tôi)'
            ? `Bạn là một Đại Năng kể chuyện, chuyên sáng tác tiểu thuyết mạng Trung Quốc thể loại '${gameSettings.theme}'. Văn phong đậm chất, sử dụng góc nhìn thứ nhất (tôi/ta), xưng hô 'bạn', 'anh ấy', 'cô ấy', 'chúng tôi', 'họ' cho các nhân vật khác.`
            : `Bạn là một Đại Năng kể chuyện, chuyên sáng tác tiểu thuyết mạng Trung Quốc thể loại '${gameSettings.theme}'. Văn phong đậm chất, sử dụng góc nhìn thứ ba, xưng hô 'anh ấy', 'cô ấy', 'họ', 'tên nhân vật' cho các nhân vật.`;
    
        const effectivePersonality = gameSettings.characterPersonality === "Tùy Chọn" ? gameSettings.customPersonality : gameSettings.characterPersonality;
    
        const initialPrompt = `
            Thông tin đầu vào:
                - Chủ đề: ${gameSettings.theme}, Bối cảnh: ${gameSettings.setting}, Độ khó: ${gameSettings.difficulty}
                - Nhân vật: ${gameSettings.characterName}, Giới tính: ${gameSettings.characterGender}, Sơ lược: ${gameSettings.characterBackstory}.
                - CỐT LÕI: Tính cách "${effectivePersonality}" và Mục tiêu "${gameSettings.characterGoal || 'chưa có'}" PHẢI ảnh hưởng mạnh mẽ đến mọi hành động và diễn biến.
                - Kỹ năng mong muốn: ${gameSettings.preferredInitialSkill || 'Để AI quyết định'}
                - NSFW: ${nsfwInstruction}.
                - Thực thể ban đầu: ${initialWorldElementsString || 'Không có.'}
                - Với yêu cầu đầu tiên, hãy bắt đầu câu chuyện. Tính cách nhân vật chính ("${effectivePersonality}") và mục tiêu ("${gameSettings.characterGoal || 'chưa có'}") PHẢI ảnh hưởng RÕ RỆT đến cách nhân vật hành xử, lựa chọn ban đầu và diễn biến mở đầu.
            `;
        const systemPrompt = `
            ${narrationInstruction}
            QUAN TRỌNG: Luôn ghi nhớ và bám sát các sự kiện, nhân vật, địa điểm, nhiệm vụ đã có trong lịch sử trò chuyện.
            Yêu cầu cụ thể về HỆ THỐNG TRẠNG THÁI, NHIỆM VỤ, TỶ LỆ THÀNH CÔNG và CÁC THẺ:
            1. Sau khi kể chuyện, hãy tạo ra một ký ức ngắn gọn về sự kiện quan trọng nhất vừa xảy ra bằng thẻ [MEMORY_ADD: "Nội dung ký ức..."].
            2. TUYỆT ĐỐI KHÔNG lặp lại hoặc tóm tắt các sự kiện đã có trong phần "Ký ức tạm thời" (Memory) trong nội dung câu chuyện chính hoặc các lựa chọn. Ký ức này chỉ dành cho AI để duy trì bối cảnh và tính nhất quán nội bộ, KHÔNG PHẢI để hiển thị lại cho người chơi.
            3. Khi nhân vật (hoặc NPC) nhận một trạng thái mới (buff, debuff, injury), dùng thẻ: [STATUS_APPLIED_SELF: name="Tên Trạng Thái", description="Mô tả", type="buff/debuff/injury/neutral", duration="X lượt/Vĩnh viễn/Đến khi được chữa/Tự hết sau X sự kiện", effects="Ảnh hưởng cụ thể", cureConditions="Vật phẩm:Tên/Hành động:Tên/Tự hết/Không thể chữa", source="Nguồn gốc"]. Tương tự với [STATUS_APPLIED_NPC: ...].
            4. Khi trạng thái được chữa khỏi hoặc hết hạn, dùng: [STATUS_CURED_SELF: Name="Tên Trạng Thái"] hoặc [STATUS_EXPIRED_SELF: Name="Tên Trạng Thái"]. Tương tự với NPC: [STATUS_CURED_NPC: NPCName="Tên", StatusName="Tên Trạng Thái"] và [STATUS_EXPIRED_NPC: ...].
            5. Các trạng thái PHẢI có ảnh hưởng thực tế đến câu chuyện, lựa chọn, hoặc khả năng của nhân vật/NPC.
            6. Tạo và thông báo kỹ năng bằng [SKILL_LEARNED: ...].
            7. Đưa các thực thể ban đầu vào câu chuyện tự nhiên.
            8. Khi nhận vật phẩm vào balo, dùng [ITEM_AQUIRED: ...]. Khi có đồng hành, dùng [COMPANION: ...].
            9. Khi giới thiệu NPC, Vật phẩm (lore), Địa điểm mới, dùng [LORE_NPC: ...], [LORE_ITEM: ...], [LORE_LOCATION: ...].
            10. Khi vật phẩm được tiêu hao, dùng [ITEM_CONSUMED: ...]. Khi cập nhật, dùng [ITEM_UPDATED: ...].
            11. HỆ THỐNG NHIỆM VỤ: Dùng [QUEST_ASSIGNED: ...], [QUEST_UPDATED: ...], [QUEST_OBJECTIVE_COMPLETED: ...].
            12. Tạo 4-5 lựa chọn hành động rõ ràng, có ý nghĩa, đa dạng, phản ánh tính cách, mục tiêu, trạng thái và nhiệm vụ.
            13. Một số lựa chọn rủi ro cần có mô tả tỷ lệ thành công (Cao, Trung Bình, Thấp) và hậu quả.
            14. Lời thoại trong ngoặc kép, suy nghĩ trong *suy nghĩ*.
            15. Duy trì độ khó. Thất bại không kết thúc game.
            16. Các thẻ lệnh phải ở dòng riêng. TUYỆT ĐỐI không viết thêm bất kỳ lời kể chuyện hay bình luận nào sau khi đã bắt đầu danh sách lựa chọn.
        `;
        setSystemInstruction(systemPrompt);
        setCurrentScreen('gameplay');
        await callAndProcessAI(initialPrompt, systemPrompt);
    };

    const handleChoice = (choiceText: string) => {
        const userChoiceEntry: StoryItem = { type: 'user_choice', content: choiceText };
        setStoryHistory(prev => [...prev, userChoiceEntry]);
        setCurrentStory(''); setChoices([]);
        
        const worldKnowledgeContext = worldKnowledge.length > 0 ? "---LUẬT LỆ VÀ TRI THỨC THẾ GIỚI (PHẢI TUÂN THỦ)---\n" + worldKnowledge.filter(r => r.enabled).map(r => `- ${r.content}`).join('\n') : "";
        const memoryContext = memories.length > 0 ? "---Bối cảnh từ ký ức gần đây (sự kiện cũ nhất ở trên cùng)---\n" + [...memories].sort((a,b) => a.timestamp - b.timestamp).map(m => `- ${m.content.replace(/\n/g, ' ')}`).join('\n') : "";
        
        const subsequentPrompt = `${worldKnowledgeContext}\n\n${memoryContext}\n\nHành động của người chơi: "${choiceText}"`.trim();
        callAndProcessAI(subsequentPrompt, systemInstruction);
    };
    
    const handleCustomAction = (actionText: string) => {
        if (!actionText.trim()) return;
        const customActionEntry: StoryItem = { type: 'user_custom_action', content: actionText };
        setStoryHistory(prev => [...prev, customActionEntry]);
        setCurrentStory(''); setChoices([]); setCustomActionInput(''); 
        
        const worldKnowledgeContext = worldKnowledge.length > 0 ? "---LUẬT LỆ VÀ TRI THỨC THẾ GIỚI (PHẢI TUÂN THỦ)---\n" + worldKnowledge.filter(r => r.enabled).map(r => `- ${r.content}`).join('\n') : "";
        const memoryContext = memories.length > 0 ? "---Bối cảnh từ ký ức gần đây (sự kiện cũ nhất ở trên cùng)---\n" + [...memories].sort((a,b) => a.timestamp - b.timestamp).map(m => `- ${m.content.replace(/\n/g, ' ')}`).join('\n') : "";
        
        const subsequentPrompt = `${worldKnowledgeContext}\n\n${memoryContext}\n\nHành động tùy chỉnh của người chơi: "${actionText}"`.trim();
        callAndProcessAI(subsequentPrompt, systemInstruction);
    };

    const restartGame = () => {
        setConfirmationModal({
            show: true, title: 'Bắt Đầu Lại?', content: 'Lưu tiến trình hiện tại trước khi bắt đầu lại?',
            onConfirm: () => {
                if (currentGameId) saveGameProgress();
                performRestart();
            },
            onCancel: () => performRestart(),
            confirmText: 'Lưu và Bắt đầu lại', cancelText: 'Bắt đầu lại (Không lưu)'
        });
    };
    
    const callGenericGenerator = async (prompt: string, field: keyof GameSettings | 'suggestedAction', modalTitle?: string) => {
        try {
            const result = await generateGenericTextViaProxy(prompt);
            if (result) {
                if(modalTitle) {
                     const suggestionsArray = result.split('\n').map(s => s.trim()).filter(Boolean);
                     setShowSuggestionsModal({ show: true, fieldType: field, suggestions: suggestionsArray, isLoading: false, title: modalTitle });
                } else {
                    setGameSettings(prev => ({ ...prev, [field]: result.split('\n')[0].trim() }));
                }
            }
        } catch (error: any) {
            setModalMessage({ show: true, title: 'Lỗi AI', content: error.message, type: 'error' });
        }
    };
    
    const handleFetchSuggestions = async (fieldType: 'theme' | 'setting') => {
        setIsFetchingSuggestions(true);
        const prompt = fieldType === 'theme'
            ? "Gợi ý 5 chủ đề độc đáo (tiếng Việt) cho game phiêu lưu văn bản, phong cách tiểu thuyết mạng. Mỗi chủ đề trên một dòng. Chỉ trả về chủ đề."
            : `Gợi ý 5 bối cảnh (tiếng Việt) cho game có chủ đề '${gameSettings.theme || 'phiêu lưu chung'}', phong cách tiểu thuyết mạng. Mỗi bối cảnh trên một dòng. Chỉ trả về bối cảnh.`;
        await callGenericGenerator(prompt, fieldType, `✨ Gợi Ý ${fieldType === 'theme' ? 'Chủ Đề' : 'Bối Cảnh'}`);
        setIsFetchingSuggestions(false);
    };

    const handleGenerateBackstory = async () => {
        setIsGeneratingContent(true);
        const effectivePersonality = gameSettings.characterPersonality === "Tùy Chọn" ? gameSettings.customPersonality : gameSettings.characterPersonality;
        const prompt = `Tên='${gameSettings.characterName || 'NV chính'}', Giới tính='${gameSettings.characterGender}', Tính cách='${effectivePersonality}', Chủ đề='${gameSettings.theme || 'Chưa rõ'}', Bối cảnh='${gameSettings.setting || 'Chưa rõ'}. Viết một tiểu sử ngắn (2-3 câu, tiếng Việt) cho nhân vật này, văn phong tiểu thuyết mạng. Chỉ trả về tiểu sử.`;
        await callGenericGenerator(prompt, 'characterBackstory');
        setIsGeneratingContent(false);
    };
    
    const handleGenerateDifficultyDescription = async () => {
        setIsGeneratingDifficultyDesc(true);
        const prompt = `Chủ đề='${gameSettings.theme || "Chưa rõ"}', bối cảnh='${gameSettings.setting || "Chưa rõ"}'. Viết mô tả ngắn (1-2 câu, tiếng Việt) về độ khó "Tuỳ Chỉnh AI" cho game, văn phong tiểu thuyết mạng. Chỉ trả về mô tả.`;
        await callGenericGenerator(prompt, 'difficultyDescription');
        setIsGeneratingDifficultyDesc(false);
    };

    const handleGenerateGoal = async () => {
        setIsGeneratingGoal(true);
        const effectivePersonality = gameSettings.characterPersonality === "Tùy Chọn" ? gameSettings.customPersonality : gameSettings.characterPersonality;
        const prompt = `Chủ đề='${gameSettings.theme}', Bối cảnh='${gameSettings.setting}', Tính cách='${effectivePersonality}', Tiểu sử='${gameSettings.characterBackstory}'. Gợi ý 3-4 mục tiêu/động lực (tiếng Việt) cho nhân vật. Mỗi mục tiêu trên một dòng.`;
        await callGenericGenerator(prompt, 'characterGoal', "✨ Gợi Ý Mục Tiêu/Động Lực");
        setIsGeneratingGoal(false);
    };
    
    const handleGenerateCharacterName = async () => {
        setIsGeneratingCharacterName(true);
        const prompt = `Chủ đề='${gameSettings.theme || "Chưa rõ"}', giới tính='${gameSettings.characterGender}'. Gợi ý MỘT tên nhân vật (tiếng Việt) phong cách tiểu thuyết mạng. Chỉ trả về tên.`;
        await callGenericGenerator(prompt, 'characterName');
        setIsGeneratingCharacterName(false);
    };

    const handleGenerateInitialSkill = async () => {
        setIsGeneratingInitialSkill(true);
        const prompt = `Chủ đề='${gameSettings.theme || "Chưa rõ"}', tiểu sử='${gameSettings.characterBackstory || "Chưa rõ"}'. Gợi ý MỘT kỹ năng khởi đầu phù hợp (tiếng Việt). Chỉ trả về tên kỹ năng.`;
        await callGenericGenerator(prompt, 'preferredInitialSkill');
        setIsGeneratingInitialSkill(false);
    };
    
    const handleGenerateSuggestedActions = async () => {
        setIsGeneratingSuggestedActions(true);
        const lastStoryItem = storyHistory.filter(item => item.type === 'story').pop()?.content || "Chưa có diễn biến.";
        const effectivePersonality = gameSettings.characterPersonality === "Tùy Chọn" ? gameSettings.customPersonality : gameSettings.characterPersonality;
        const prompt = `Bối cảnh: ${lastStoryItem}. Tính cách NV: ${effectivePersonality}. Mục tiêu: ${gameSettings.characterGoal || 'Chưa rõ'}. Gợi ý 3-4 hành động ngắn gọn, phù hợp (tiếng Việt). Mỗi gợi ý trên một dòng.`;
        await callGenericGenerator(prompt, 'suggestedAction', "💡 Gợi Ý Hành Động");
        setIsGeneratingSuggestedActions(false);
    };
    
    const handleGenerateInitialElementDescription = async (index: number) => {
        const element = gameSettings.initialWorldElements[index];
        if (!element || !element.name) {
            setModalMessage({ show: true, title: "Thiếu Tên", content: "Vui lòng nhập tên thực thể trước khi tạo mô tả.", type: "info" });
            return;
        }
        setIsGeneratingInitialElementDesc(prev => ({ ...prev, [element.id]: true }));
        const personalityInfo = element.type === 'NPC' && element.personality ? `Tính cách NPC đã cho: ${element.personality}.` : 'Tính cách NPC: AI tự quyết định.';
        const prompt = `Chủ đề: '${gameSettings.theme || "Chưa rõ"}', Bối cảnh: '${gameSettings.setting || "Chưa rõ"}', Tên: '${element.name}', Loại: '${element.type}', ${personalityInfo}. Viết một mô tả ngắn (1-3 câu) bằng tiếng Việt cho thực thể này, phong cách tiểu thuyết mạng.`;
        try {
            const generatedText = await generateGenericTextViaProxy(prompt);
            setGameSettings(prev => {
                const updatedElements = [...prev.initialWorldElements];
                updatedElements[index] = { ...updatedElements[index], description: generatedText };
                return { ...prev, initialWorldElements: updatedElements };
            });
        } catch(e:any) {
             setModalMessage({ show: true, title: "Lỗi AI", content: e.message, type: "error" });
        }
        setIsGeneratingInitialElementDesc(prev => ({ ...prev, [element.id]: false }));
    };

    const handleSaveGameToFile = () => {
        if (storyHistory.length === 0) {
            setModalMessage({ show: true, title: 'Không Thể Lưu', content: 'Không có gì để lưu. Hãy bắt đầu cuộc phiêu lưu trước.', type: 'info' }); return;
        }
        const gameState: Omit<SavedGame, 'currentStory' | 'currentChoices'> = {
            id: currentGameId!, settings: gameSettings, storyHistory, geminiHistory,
            knowledgeBase, memories, worldKnowledge, systemInstruction,
            updatedAt: Date.now(),
        };
        const jsonString = JSON.stringify(gameState, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = `${(gameSettings.theme || 'phieu-luu').replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setModalMessage({ show: true, title: 'Đã Lưu', content: `Game đã được lưu vào tệp "${fileName}".`, type: 'success' });
    };

    const handleLoadGameFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const gameData: SavedGame = JSON.parse(text);
                if (!gameData.settings || !gameData.storyHistory) throw new Error("Tệp lưu không hợp lệ hoặc bị hỏng.");
                loadGame(gameData);
                setModalMessage({ show: true, title: 'Tải Thành Công', content: `Đã tải game từ tệp "${file.name}".`, type: 'success' });
            } catch (error: any) {
                setModalMessage({ show: true, title: 'Lỗi Tải Game', content: `Không thể tải game từ tệp: ${error.message}`, type: 'error' });
            } finally {
                if (event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const loadGame = (gameData: SavedGame) => {
        setGameSettings(gameData.settings);
        setKnowledgeBase(gameData.knowledgeBase);
        setMemories(gameData.memories || []);
        setWorldKnowledge(gameData.worldKnowledge || []);
        setStoryHistory(gameData.storyHistory || []);
        setGeminiHistory(gameData.geminiHistory || []);
        setSystemInstruction(gameData.systemInstruction || '');
        setCurrentGameId(gameData.id || crypto.randomUUID());
        
        // Re-create the last state from history
        const lastModelTurn = gameData.geminiHistory?.filter(h => h.role === 'model').pop();
        if(lastModelTurn) {
            parseGeminiResponseAndUpdateState(lastModelTurn.parts[0].text).then(({story, choices}) => {
                setCurrentStory(story);
                setChoices(choices);
            });
        }

        setCurrentScreen('gameplay');
        setShowLoadGameModal(false);
    };

    const addInitialWorldElement = () => setGameSettings(prev => ({ ...prev, initialWorldElements: [...prev.initialWorldElements, { id: crypto.randomUUID(), type: 'NPC', name: '', description: '', personality: '' }] }));
    const removeInitialWorldElement = (id: string) => setGameSettings(prev => ({ ...prev, initialWorldElements: prev.initialWorldElements.filter(el => el.id !== id) }));
    const handleInitialElementChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setGameSettings(prev => {
            const updatedElements = [...prev.initialWorldElements];
            updatedElements[index] = { ...updatedElements[index], [name]: value };
            return { ...prev, initialWorldElements: updatedElements };
        });
    };
    
    const togglePinMemory = (id: string) => setMemories(mems => mems.map(mem => mem.id === id ? { ...mem, pinned: !mem.pinned } : mem).sort((a, b) => b.timestamp - a.timestamp));
    const clearAllMemories = () => setConfirmationModal({ show: true, title: 'Xóa Tất Cả Ký Ức?', content: 'Bạn có chắc muốn xóa toàn bộ ký ức tạm thời không?', onConfirm: () => setMemories([]), confirmText: "Xóa Tất Cả", cancelText: "Hủy" });
    
    const addWorldKnowledgeRule = () => setWorldKnowledge(prev => [...prev, { id: crypto.randomUUID(), content: '', enabled: true }]);
    const updateWorldKnowledgeRule = (id: string, content: string) => setWorldKnowledge(prev => prev.map(rule => rule.id === id ? { ...rule, content } : rule));
    const toggleWorldKnowledgeRule = (id: string) => setWorldKnowledge(prev => prev.map(rule => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule));
    const deleteWorldKnowledgeRule = (id: string) => setWorldKnowledge(prev => prev.filter(rule => rule.id !== id));
    
    
    return {
        currentScreen, setCurrentScreen, gameSettings, setGameSettings, handleInputChange, initializeGame, isLoading,
        handleFetchSuggestions, isFetchingSuggestions, handleGenerateBackstory, isGeneratingContent, handleGenerateDifficultyDescription,
        isGeneratingDifficultyDesc, addInitialWorldElement, removeInitialWorldElement, handleInitialElementChange,
        handleGenerateInitialElementDescription, isGeneratingInitialElementDesc, handleGenerateGoal, isGeneratingGoal,
        handleGenerateCharacterName, isGeneratingCharacterName, handleGenerateInitialSkill, isGeneratingInitialSkill,
        goHome, restartGame, storyHistory, currentStory, choices, handleChoice, formatStoryText, customActionInput,
        setCustomActionInput, handleCustomAction, knowledgeBase, showCharacterInfoModal, setShowCharacterInfoModal,
        isSaving, showMemoryModal, setShowMemoryModal, showWorldKnowledgeModal, setShowWorldKnowledgeModal, handleSaveGameToFile,
        showUpdateLogModal, setShowUpdateLogModal, handleLoadGameFromFile, showLoadGameModal, setShowLoadGameModal,
        savedGames, loadGame, setConfirmationModal, setModalMessage, modalMessage, confirmationModal, showSuggestionsModal,
        setShowSuggestionsModal, handleGenerateSuggestedActions, isGeneratingSuggestedActions, showQuickLoreModal,
        quickLoreContent, setShowQuickLoreModal, memories, togglePinMemory, clearAllMemories, worldKnowledge,
        addWorldKnowledgeRule, updateWorldKnowledgeRule, toggleWorldKnowledgeRule, deleteWorldKnowledgeRule, openQuickLoreModal,
    };
};
