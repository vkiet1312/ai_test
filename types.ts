
export interface GameSettings {
  theme: string;
  setting: string;
  characterName: string;
  characterPersonality: string;
  customPersonality: string;
  characterGender: string;
  characterBackstory: string;
  preferredInitialSkill: string;
  difficulty: string;
  difficultyDescription: string;
  allowNsfw: boolean;
  initialWorldElements: InitialWorldElement[];
  useCharacterGoal: boolean;
  characterGoal: string;
  allowCustomActionInput: boolean;
  narrationStyle: string;
}

export interface InitialWorldElement {
  id: string;
  type: 'NPC' | 'LOCATION' | 'ITEM';
  name: string;
  description: string;
  personality?: string;
}

export interface StoryItem {
  type: 'story' | 'user_choice' | 'user_custom_action' | 'system';
  content: string;
}

export interface KnowledgeItem {
    id: string;
    Name?: string;
    name?: string;
    title?: string;
    Description?: string;
    description?: string;
    [key: string]: any;
}
export interface Quest extends KnowledgeItem {
    title: string;
    description: string;
    status: 'active' | 'completed' | 'failed';
    objectives: { text: string; completed: boolean }[];
}

export interface KnowledgeBase {
  npcs: KnowledgeItem[];
  items: KnowledgeItem[];
  locations: KnowledgeItem[];
  companions: KnowledgeItem[];
  inventory: KnowledgeItem[];
  playerSkills: KnowledgeItem[];
  relationships: KnowledgeItem[];
  playerStatus: KnowledgeItem[];
  quests: Quest[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    type: 'NEW' | 'FIX' | 'IMPROVE' | 'UI' | 'AI';
    text: string;
  }[];
}

export interface SavedGame {
  id: string;
  settings: GameSettings;
  storyHistory: StoryItem[];
  geminiHistory: GeminiHistoryItem[];
  knowledgeBase: KnowledgeBase;
  memories: Memory[];
  worldKnowledge: WorldKnowledgeRule[];
  systemInstruction: string;
  updatedAt: number; 
}

export interface ModalMessage {
  show: boolean;
  title: string;
  content: string;
  type: 'info' | 'success' | 'error';
}

export interface ConfirmationModalState {
  show: boolean;
  title: string;
  content: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText: string;
  cancelText: string;
}

export interface SuggestionsModalState {
    show: boolean;
    fieldType: keyof GameSettings | 'suggestedAction' | null;
    suggestions: string[];
    isLoading: boolean;
    title: string;
}

export interface Memory {
    id: string;
    content: string;
    pinned: boolean;
    timestamp: number;
}

export interface WorldKnowledgeRule {
    id: string;
    content: string;
    enabled: boolean;
}

export interface QuickLoreItem extends KnowledgeItem {
    category: string;
}

export interface GeminiHistoryItem {
    role: 'user' | 'model';
    parts: { text: string }[];
}
