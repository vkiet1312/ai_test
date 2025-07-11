
import React from 'react';
import type { GameSettings, StoryItem, KnowledgeBase, QuickLoreItem } from '../types';

interface GameplayScreenProps {
    goHome: () => void;
    gameSettings: GameSettings;
    restartGame: () => void;
    storyHistory: StoryItem[];
    isLoading: boolean;
    currentStory: string;
    choices: string[];
    handleChoice: (choice: string) => void;
    formatStoryText: (text: string) => React.ReactNode;
    customActionInput: string;
    setCustomActionInput: (value: string) => void;
    handleCustomAction: (action: string) => void;
    knowledgeBase: KnowledgeBase;
    setShowCharacterInfoModal: (show: boolean) => void;
    handleGenerateSuggestedActions: () => void;
    isGeneratingSuggestedActions: boolean;
    isSaving: boolean;
    setShowMemoryModal: (show: boolean) => void;
    setShowWorldKnowledgeModal: (show: boolean) => void;
    handleSaveGameToFile: () => void;
    openQuickLoreModal: (item: any, category: string) => void;
}

const GameplayScreen: React.FC<GameplayScreenProps> = ({
    goHome, gameSettings, restartGame, storyHistory, isLoading, currentStory,
    choices, handleChoice, formatStoryText, customActionInput, setCustomActionInput,
    handleCustomAction, knowledgeBase, setShowCharacterInfoModal,
    handleGenerateSuggestedActions, isGeneratingSuggestedActions, isSaving,
    setShowMemoryModal, setShowWorldKnowledgeModal, handleSaveGameToFile,
    openQuickLoreModal
}) => (
    <div className="h-screen bg-gray-900 text-gray-100 flex flex-col p-2 md:p-4 font-sans">
        <header className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-center mb-3 gap-2 p-2 bg-gray-800/50 rounded-lg shadow-md">
            <button onClick={goHome} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-lg shadow-md transition-colors flex items-center self-start sm:self-center text-sm">
                ↩️ Về Trang Chủ
            </button>
            <div className="text-center flex-1 mx-2 order-first sm:order-none max-w-md sm:max-w-full"> 
                <h1 className="text-lg md:text-xl font-bold text-purple-300" title={gameSettings.theme || "Cuộc Phiêu Lưu"}>
                    {gameSettings.theme || "Cuộc Phiêu Lưu"}
                </h1>
                 {gameSettings.characterPersonality && (
                    <p className="text-xs text-sky-300 flex items-center justify-center mt-0.5" title={`Tính cách: ${gameSettings.characterPersonality}`}>
                        <span className="mr-1">🎭</span>
                        <span className="leading-tight">Tính cách: {gameSettings.characterPersonality === "Tùy Chọn" ? gameSettings.customPersonality : gameSettings.characterPersonality}</span>
                    </p>
                )}
                {gameSettings.useCharacterGoal && gameSettings.characterGoal && (
                     <div className="text-xs text-red-300 flex items-start justify-center text-center mt-0.5" title={`Mục tiêu: ${gameSettings.characterGoal}`}>
                        <span className="mr-1">🎯</span>
                        <span className="ml-1 leading-tight">Mục tiêu: {gameSettings.characterGoal}</span>
                    </div>
                )}
            </div>
            <div className="flex gap-1.5 self-end sm:self-center flex-wrap justify-end items-center">
                {isSaving && <div className="text-xs text-gray-400 italic mr-2 animate-pulse">Đang lưu...</div>}
                 <button onClick={handleSaveGameToFile} disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-2.5 rounded-lg shadow-md transition-colors flex items-center text-xs disabled:bg-gray-500">
                    📥 Lưu Vào Tệp
                </button>
                 <button onClick={() => setShowWorldKnowledgeModal(true)} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-2.5 rounded-lg shadow-md transition-colors flex items-center text-xs disabled:bg-gray-500">
                    🌍 Tri Thức
                </button>
                <button onClick={() => setShowMemoryModal(true)} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-2.5 rounded-lg shadow-md transition-colors flex items-center text-xs disabled:bg-gray-500">
                    🧠 Ký Ức
                </button>
                <button onClick={() => setShowCharacterInfoModal(true)} disabled={isLoading} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-2.5 rounded-lg shadow-md transition-colors flex items-center text-xs disabled:bg-gray-500">
                    📝 Thông Tin
                </button>
                <button onClick={restartGame} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-2.5 rounded-lg shadow-md transition-colors flex items-center text-xs disabled:bg-gray-500">
                    🔄 Bắt Đầu Lại
                </button>
            </div>
        </header>
        
        <div className="flex-grow bg-gray-800 p-3 md:p-5 rounded-xl shadow-2xl overflow-y-auto mb-3 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-700 min-h-0" id="story-content-area"> 
            <h2 className="text-lg font-semibold text-green-400 mb-2">Diễn biến câu chuyện:</h2>
            {storyHistory.map((item, index) => (
                <div key={index} className={`story-item mb-3 p-3 rounded-lg shadow-sm
                    ${item.type === 'story' ? 'bg-gray-700/80' : 
                      item.type === 'user_choice' ? 'bg-blue-900/70 text-blue-200 ring-1 ring-blue-700' : 
                      item.type === 'user_custom_action' ? 'bg-indigo-900/70 text-indigo-200 ring-1 ring-indigo-700' :
                      'bg-yellow-800/70 text-yellow-200 ring-1 ring-yellow-700'}`}>
                    {item.type === 'user_choice' && <p className="font-semibold text-blue-300">Bạn đã chọn:</p>}
                    {item.type === 'user_custom_action' && <p className="font-semibold text-indigo-300">Hành động của bạn:</p>}
                    {item.type === 'system' && <p className="font-semibold text-yellow-300">Thông báo hệ thống:</p>}
                    <div className="prose prose-sm prose-invert max-w-none text-gray-200">{formatStoryText(item.content)}</div>
                </div>
            ))}
            {isLoading && currentStory === '' && (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
                    <p className="mt-3 text-purple-300">AI đang viết tiếp câu chuyện...</p>
                </div>
            )}
        </div>

        {!isLoading && (
            <div className="flex-shrink-0 bg-gray-800 p-3 md:p-5 rounded-xl shadow-xl">
                {choices.length > 0 && (
                    <>
                        <h3 className="text-lg font-semibold text-green-400 mb-3">Lựa chọn của bạn:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            {choices.map((choice, index) => (
                                <button key={index} onClick={() => handleChoice(choice)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75">
                                    {index + 1}. {choice}
                                </button>
                            ))}
                        </div>
                    </>
                )}
                {gameSettings.allowCustomActionInput && ( 
                    <div>
                        <label htmlFor="customActionInput" className="block text-md font-medium text-gray-300 mb-1">Hoặc nhập hành động tùy ý:</label>
                        <div className="flex gap-2">
                            <input type="text" id="customActionInput" value={customActionInput} onChange={(e) => setCustomActionInput(e.target.value)} placeholder="Ví dụ: Nhìn xung quanh, Hỏi về chiếc chìa khóa..."
                                className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-purple-500 focus:border-purple-500"
                                onKeyPress={(e) => e.key === 'Enter' && handleCustomAction(customActionInput)}
                            />
                             <button onClick={() => handleCustomAction(customActionInput)} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-5 rounded-lg shadow-md hover:shadow-lg transition-colors disabled:bg-gray-500">
                                Gửi
                            </button>
                        </div>
                    </div>
                )}
                 <button onClick={handleGenerateSuggestedActions} disabled={isGeneratingSuggestedActions || isLoading} className="mt-3 w-full sm:w-auto p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md disabled:bg-gray-500 flex items-center justify-center" title="AI Gợi Ý Hành Động">
                    {isGeneratingSuggestedActions ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div> : <span className="mr-2">💡</span>}
                    AI Gợi Ý Hành Động
                </button>
            </div>
        )}
         {isLoading && choices.length === 0 && currentStory !== '' && ( 
            <div className="text-center py-5 flex-shrink-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
                <p className="mt-2 text-purple-300">Đang tạo lựa chọn...</p>
            </div>
        )}
    </div>
);

export default GameplayScreen;
