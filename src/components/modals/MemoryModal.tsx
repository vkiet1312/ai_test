
import React from 'react';
import type { Memory } from '../../types';

interface MemoryModalProps {
    show: boolean;
    onClose: () => void;
    memories: Memory[];
    togglePinMemory: (id: string) => void;
    clearAllMemories: () => void;
}

const MemoryModal: React.FC<MemoryModalProps> = ({ show, onClose, memories, togglePinMemory, clearAllMemories }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[100]">
            <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-blue-600">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-blue-400">🧠 Ký Ức Tạm Thời</h2>
                    <button onClick={clearAllMemories} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-md text-sm shadow hover:shadow-md transition-all">
                        🗑️ Xóa Tất Cả
                    </button>
                </div>
                <div className="overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-700">
                    {memories.length === 0 ? (
                        <p className="text-gray-400 text-center py-6">Chưa có ký ức nào.</p>
                    ) : (
                        memories.map(memory => (
                            <div key={memory.id} className={`p-3 rounded-lg transition-colors shadow-md flex justify-between items-start gap-4 ${memory.pinned ? 'bg-blue-900/50 border border-blue-700' : 'bg-gray-700'}`}>
                                <p className="text-sm text-gray-200 whitespace-pre-line flex-1">{memory.content}</p>
                                <button
                                    onClick={() => togglePinMemory(memory.id)}
                                    className={`py-1 px-3 rounded-md text-xs font-semibold transition-colors flex-shrink-0 ${memory.pinned ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-gray-600 hover:bg-gray-500 text-white'}`}
                                >
                                    {memory.pinned ? '✅ Đã Ghim' : '📌 Ghim'}
                                </button>
                            </div>
                        ))
                    )}
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors">
                    Đóng
                </button>
            </div>
        </div>
    );
};

export default MemoryModal;