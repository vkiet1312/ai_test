
import React from 'react';
import type { SavedGame } from '../types';

interface InitialScreenProps {
    setCurrentScreen: (screen: 'setup' | 'initial' | 'gameplay') => void;
    setShowLoadGameModal: (show: boolean) => void;
    savedGames: SavedGame[];
    setShowUpdateLogModal: (show: boolean) => void;
    handleLoadGameFromFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InitialScreen: React.FC<InitialScreenProps> = ({
    setCurrentScreen,
    setShowLoadGameModal,
    savedGames,
    setShowUpdateLogModal,
    handleLoadGameFromFile
}) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const handleFileLoadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 mb-12 text-center animate-pulse">
                Nhập Vai A.I Simulator
            </h1>
            <div className="space-y-4 w-full max-w-md">
                <button 
                    onClick={() => setCurrentScreen('setup')} 
                    className="w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 text-xl focus:outline-none focus:ring-4 focus:ring-pink-400 focus:ring-opacity-50"
                >
                    ▶️ Bắt Đầu Cuộc Phiêu Lưu Mới
                </button>
                <button 
                    onClick={() => setShowLoadGameModal(true)} 
                    disabled={savedGames.length === 0} 
                    className="w-full flex items-center justify-center bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-lg disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-cyan-400 focus:ring-opacity-50"
                >
                    💾 Tải Game Đã Lưu ({savedGames.length})
                </button>
                <button 
                    onClick={handleFileLoadClick} 
                    className="w-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50"
                >
                    📂 Tải Game Từ Tệp (.json)
                </button>
                <input type="file" ref={fileInputRef} onChange={handleLoadGameFromFile} accept=".json" className="hidden" />
                <button 
                    onClick={() => setShowUpdateLogModal(true)} 
                    className="w-full flex items-center justify-center bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-lg focus:outline-none focus:ring-4 focus:ring-teal-400 focus:ring-opacity-50"
                >
                    📢 Xem Cập Nhật Game
                </button>
            </div>
        </div>
    );
}

export default InitialScreen;