
import React from 'react';
import { useGameData } from './hooks/useGameData';
import { changelogData } from './constants';
import InitialScreen from './components/InitialScreen';
import GameSetupScreen from './components/GameSetupScreen';
import GameplayScreen from './components/GameplayScreen';
import UpdateLogModal from './components/modals/UpdateLogModal';
import LoadGameModal from './components/modals/LoadGameModal';
import MessageModal from './components/modals/MessageModal';
import ConfirmationModal from './components/modals/ConfirmationModal';
import CharacterInfoModal from './components/modals/CharacterInfoModal';
import QuickLoreModal from './components/modals/QuickLoreModal';
import SuggestionsModal from './components/modals/SuggestionsModal';
import MemoryModal from './components/modals/MemoryModal';
import WorldKnowledgeModal from './components/modals/WorldKnowledgeModal';

const App: React.FC = () => {
  const gameData = useGameData();

  if (!gameData) {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="text-2xl animate-pulse">Đang tải ứng dụng...</div>
        </div>
    );
  }

  const {
    currentScreen,
    setCurrentScreen,
    gameSettings,
    handleInputChange,
    initializeGame,
    isLoading,
    handleFetchSuggestions,
    isFetchingSuggestions,
    handleGenerateBackstory,
    isGeneratingContent,
    handleGenerateDifficultyDescription,
    isGeneratingDifficultyDesc,
    addInitialWorldElement,
    removeInitialWorldElement,
    handleInitialElementChange,
    handleGenerateInitialElementDescription,
    isGeneratingInitialElementDesc,
    handleGenerateGoal,
    isGeneratingGoal,
    handleGenerateCharacterName,
    isGeneratingCharacterName,
    handleGenerateInitialSkill,
    isGeneratingInitialSkill,
    goHome,
    restartGame,
    storyHistory,
    currentStory,
    choices,
    handleChoice,
    formatStoryText,
    customActionInput,
    setCustomActionInput,
    handleCustomAction,
    knowledgeBase,
    showCharacterInfoModal,
    setShowCharacterInfoModal,
    isSaving,
    showMemoryModal,
    setShowMemoryModal,
    showWorldKnowledgeModal,
    setShowWorldKnowledgeModal,
    handleSaveGameToFile,
    showUpdateLogModal,
    setShowUpdateLogModal,
    handleLoadGameFromFile,
    showLoadGameModal,
    setShowLoadGameModal,
    savedGames,
    loadGame,
    setConfirmationModal,
    setModalMessage,
    modalMessage,
    confirmationModal,
    showSuggestionsModal,
    setShowSuggestionsModal,
    setGameSettings,
    handleGenerateSuggestedActions,
    isGeneratingSuggestedActions,
    showQuickLoreModal,
    quickLoreContent,
    setShowQuickLoreModal,
    memories,
    togglePinMemory,
    clearAllMemories,
    worldKnowledge,
    addWorldKnowledgeRule,
    updateWorldKnowledgeRule,
    toggleWorldKnowledgeRule,
    deleteWorldKnowledgeRule,
    openQuickLoreModal
  } = gameData;

  return (
    <div className="font-sans text-white bg-gray-900">
      {currentScreen === 'initial' && (
        <InitialScreen
          setCurrentScreen={setCurrentScreen}
          setShowLoadGameModal={setShowLoadGameModal}
          savedGames={savedGames}
          setShowUpdateLogModal={setShowUpdateLogModal}
          handleLoadGameFromFile={handleLoadGameFromFile}
        />
      )}
      {currentScreen === 'setup' && (
        <GameSetupScreen
          goHome={goHome}
          gameSettings={gameSettings}
          handleInputChange={handleInputChange}
          initializeGame={initializeGame}
          isLoading={isLoading}
          handleFetchSuggestions={handleFetchSuggestions}
          isFetchingSuggestions={isFetchingSuggestions}
          handleGenerateBackstory={handleGenerateBackstory}
          isGeneratingContent={isGeneratingContent}
          handleGenerateDifficultyDescription={handleGenerateDifficultyDescription}
          isGeneratingDifficultyDesc={isGeneratingDifficultyDesc}
          addInitialWorldElement={addInitialWorldElement}
          removeInitialWorldElement={removeInitialWorldElement}
          handleInitialElementChange={handleInitialElementChange}
          handleGenerateInitialElementDescription={handleGenerateInitialElementDescription}
          isGeneratingInitialElementDesc={isGeneratingInitialElementDesc}
          handleGenerateGoal={handleGenerateGoal}
          isGeneratingGoal={isGeneratingGoal}
          handleGenerateCharacterName={handleGenerateCharacterName}
          isGeneratingCharacterName={isGeneratingCharacterName}
          handleGenerateInitialSkill={handleGenerateInitialSkill}
          isGeneratingInitialSkill={isGeneratingInitialSkill}
        />
      )}
      {currentScreen === 'gameplay' && (
        <GameplayScreen
          goHome={goHome}
          gameSettings={gameSettings}
          restartGame={restartGame}
          storyHistory={storyHistory}
          isLoading={isLoading}
          currentStory={currentStory}
          choices={choices}
          handleChoice={handleChoice}
          formatStoryText={formatStoryText}
          customActionInput={customActionInput}
          setCustomActionInput={setCustomActionInput}
          handleCustomAction={handleCustomAction}
          knowledgeBase={knowledgeBase}
          setShowCharacterInfoModal={setShowCharacterInfoModal}
          handleGenerateSuggestedActions={handleGenerateSuggestedActions}
          isGeneratingSuggestedActions={isGeneratingSuggestedActions}
          isSaving={isSaving}
          setShowMemoryModal={setShowMemoryModal}
          setShowWorldKnowledgeModal={setShowWorldKnowledgeModal}
          handleSaveGameToFile={handleSaveGameToFile}
          openQuickLoreModal={openQuickLoreModal}
        />
      )}

      {showUpdateLogModal && (
        <UpdateLogModal
          show={showUpdateLogModal}
          onClose={() => setShowUpdateLogModal(false)}
          changelog={changelogData}
        />
      )}

      {showLoadGameModal && (
        <LoadGameModal
          savedGames={savedGames}
          loadGame={loadGame}
          setShowLoadGameModal={setShowLoadGameModal}
          setConfirmationModal={setConfirmationModal}
          setModalMessage={setModalMessage}
        />
      )}

      {showCharacterInfoModal && (
        <CharacterInfoModal
          knowledge={knowledgeBase}
          show={showCharacterInfoModal}
          onClose={() => setShowCharacterInfoModal(false)}
          characterPersonality={
            gameSettings.characterPersonality === "Tùy Chọn"
              ? gameSettings.customPersonality
              : gameSettings.characterPersonality
          }
          characterName={gameSettings.characterName}
        />
      )}

      {showQuickLoreModal && (
        <QuickLoreModal
          loreItem={quickLoreContent}
          show={showQuickLoreModal}
          onClose={() => setShowQuickLoreModal(false)}
        />
      )}

      {showMemoryModal && (
        <MemoryModal
          show={showMemoryModal}
          onClose={() => setShowMemoryModal(false)}
          memories={memories}
          togglePinMemory={togglePinMemory}
          clearAllMemories={clearAllMemories}
        />
      )}

      {showWorldKnowledgeModal && (
        <WorldKnowledgeModal
          show={showWorldKnowledgeModal}
          onClose={() => setShowWorldKnowledgeModal(false)}
          worldKnowledge={worldKnowledge}
          addRule={addWorldKnowledgeRule}
          updateRule={updateWorldKnowledgeRule}
          toggleRule={toggleWorldKnowledgeRule}
          deleteRule={deleteWorldKnowledgeRule}
        />
      )}
      
      <SuggestionsModal
          show={showSuggestionsModal.show}
          title={showSuggestionsModal.title || "✨ Gợi Ý"}
          suggestions={showSuggestionsModal.suggestions}
          isLoading={showSuggestionsModal.isLoading}
          onSelect={(suggestion) => {
              if (showSuggestionsModal.fieldType) {
                if (showSuggestionsModal.fieldType === 'suggestedAction') {
                  setCustomActionInput(suggestion);
                } else {
                  setGameSettings(prev => ({ ...prev, [showSuggestionsModal.fieldType!]: suggestion }));
                }
              }
          }}
          onClose={() => setShowSuggestionsModal({ show: false, fieldType: null, suggestions: [], isLoading: false, title: '' })}
      />

      <MessageModal
        show={modalMessage.show}
        title={modalMessage.title}
        content={modalMessage.content}
        type={modalMessage.type}
        onClose={() => setModalMessage({ show: false, title: '', content: '', type: 'info' })}
      />

      <ConfirmationModal
        show={confirmationModal.show}
        title={confirmationModal.title}
        content={confirmationModal.content}
        onConfirm={confirmationModal.onConfirm}
        onCancel={confirmationModal.onCancel}
        confirmText={confirmationModal.confirmText}
        cancelText={confirmationModal.cancelText}
        setConfirmationModal={setConfirmationModal}
      />
    </div>
  );
};

export default App;
