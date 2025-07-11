
import React from 'react';
import type { WorldKnowledgeRule } from '../../types';

interface WorldKnowledgeModalProps {
    show: boolean;
    onClose: () => void;
    worldKnowledge: WorldKnowledgeRule[];
    addRule: () => void;
    updateRule: (id: string, content: string) => void;
    toggleRule: (id: string) => void;
    deleteRule: (id: string) => void;
}

const WorldKnowledgeModal: React.FC<WorldKnowledgeModalProps> = ({ show, onClose, worldKnowledge, addRule, updateRule, toggleRule, deleteRule }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[100]">
            <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-green-600">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-green-400">🌍 Tri Thức Thế Giới</h2>
                </div>
                <div className="overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-700 flex-grow">
                    {worldKnowledge.length === 0 ? (
                        <p className="text-gray-400 text-center py-6">Chưa có luật lệ hay tri thức nào được thêm vào.</p>
                    ) : (
                        worldKnowledge.map((rule) => (
                            <div key={rule.id} className="p-3 bg-gray-700/80 rounded-lg flex items-start gap-3">
                                <textarea
                                    value={rule.content}
                                    onChange={(e) => updateRule(rule.id, e.target.value)}
                                    placeholder="Nhập một luật lệ hoặc tri thức về thế giới (VD: 'Tất cả rồng đều sợ nước', 'Ma thuật lửa bị yếu đi vào ban đêm')..."
                                    className="flex-grow bg-gray-600 text-white p-2 rounded-md text-sm border border-gray-500 focus:ring-green-500 focus:border-green-500"
                                    rows={2}
                                />
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => toggleRule(rule.id)} className={`py-1 px-2 text-xs rounded-md font-semibold ${rule.enabled ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-400'}`}>
                                        {rule.enabled ? '✅ Bật' : '⚫ Tắt'}
                                    </button>
                                     <button onClick={() => deleteRule(rule.id)} className="bg-red-700 hover:bg-red-800 text-white font-semibold py-1 px-2 rounded-md text-xs">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                 <button onClick={addRule} className="mt-4 w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors">
                    ➕ Thêm Luật Mới
                </button>
                <button onClick={onClose} className="mt-2 w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors">
                    Đóng
                </button>
            </div>
        </div>
    );
};

export default WorldKnowledgeModal;
