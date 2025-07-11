
import React from 'react';
import type { SavedGame, ConfirmationModalState, ModalMessage } from '../../types';

interface LoadGameModalProps {
    savedGames: SavedGame[];
    loadGame: (game: SavedGame) => void;
    setShowLoadGameModal: (show: boolean) => void;
    setConfirmationModal: (state: ConfirmationModalState) => void;
    setModalMessage: (message: ModalMessage) => void;
}

const LoadGameModal: React.FC<LoadGameModalProps> = ({ 
    savedGames, loadGame, setShowLoadGameModal, setConfirmationModal, setModalMessage 
}) => {
    
    const deleteGame = (gameId: string, gameTheme: string) => {
        const updatedGames = savedGames.filter(g => g.id !== gameId);
        localStorage.setItem('ai-rpg-saved-games-v2', JSON.stringify(updatedGames));
        // This is a bit of a hack. A better way would be to lift state up
        // or use a global state manager. For now, we force a reload to see changes.
        setModalMessage({ show: true, title: 'Đã Xóa', content: `Game "${gameTheme || gameId}" đã được xóa.`, type: 'success' });
        setShowLoadGameModal(false); 
        window.location.reload(); // Force reload to reflect changes
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-blue-600">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">💾 Tải Game Đã Lưu</h2>
            {savedGames.length === 0 ? (
              <p className="text-gray-400 text-center py-6">Bạn chưa có cuộc phiêu lưu nào được lưu lại.</p>
            ) : (
              <div className="overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-700">
                {savedGames.map(game => (
                  <div key={game.id} className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600/80 transition-colors shadow-md hover:shadow-lg">
                    <h3 className="text-lg font-semibold text-green-400 truncate" title={game.settings?.theme}>{game.settings?.theme || "Game Chưa Có Tên"}</h3>
                    <p className="text-sm text-gray-300">Nhân vật: {game.settings?.characterName || "N/A"} (Tính cách: {game.settings?.characterPersonality === "Tùy Chọn" ? game.settings.customPersonality : game.settings?.characterPersonality || "Chưa rõ"})</p>
                    {game.settings?.useCharacterGoal && game.settings?.characterGoal && (
                        <p className="text-xs text-red-300 truncate" title={`Mục tiêu: ${game.settings.characterGoal}`}>
                            Mục tiêu: {game.settings.characterGoal.substring(0,70)}{game.settings.characterGoal.length > 70 ? "..." : ""}
                        </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Lần cập nhật cuối: {new Date(game.updatedAt).toLocaleString('vi-VN')}
                    </p>
                     <p className="text-xs text-gray-400">Độ khó: {game.settings?.difficulty || "Không rõ"}</p>
                    <div className="mt-3 flex space-x-2">
                        <button onClick={() => loadGame(game)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-md text-sm shadow hover:shadow-md transition-all">
                        Tải Game Này
                        </button>
                        <button onClick={() => {
                            setConfirmationModal({
                                show: true, title: 'Xác Nhận Xóa Game', content: `Bạn có chắc chắn muốn xóa game "${game.settings?.theme || game.id}" không? Hành động này không thể hoàn tác.`,
                                onConfirm: () => {
                                    deleteGame(game.id, game.settings?.theme);
                                },
                                confirmText: "Xóa Game", cancelText: "Hủy Bỏ"
                            });
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-md text-sm shadow hover:shadow-md transition-all">
                        🗑️ Xóa
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowLoadGameModal(false)} className="mt-6 w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors">
              Đóng
            </button>
          </div>
        </div>
      );
}

export default LoadGameModal;
