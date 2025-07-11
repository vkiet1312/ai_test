
import React from 'react';
import type { ConfirmationModalState } from '../../types';

interface ConfirmationModalProps extends ConfirmationModalState {
    setConfirmationModal: (state: ConfirmationModalState) => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    show, title, content, onConfirm, onCancel, confirmText = "Xác nhận", cancelText = "Hủy", setConfirmationModal 
}) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[100]"> 
        <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-md border border-yellow-700">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">⚠️</span>
            <h3 className="text-xl font-semibold text-yellow-400">{title}</h3>
          </div>
          <p className="text-gray-300 mb-6 whitespace-pre-line">{content}</p>
          <div className="flex flex-col sm:flex-row-reverse gap-2">
            <button 
              onClick={() => { 
                onConfirm(); 
                setConfirmationModal({ ...{ show, title, content, onConfirm, onCancel, confirmText, cancelText }, show: false });
              }} 
              className={`w-full sm:w-auto flex-1 sm:flex-none sm:px-6 text-white font-semibold py-2.5 px-4 rounded-lg shadow hover:shadow-md transition-all ${confirmText.toLowerCase().includes("xóa") ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
              {confirmText}
            </button>
            <button 
              onClick={() => { 
                if (onCancel) onCancel(); 
                setConfirmationModal({ ...{ show, title, content, onConfirm, onCancel, confirmText, cancelText }, show: false });
              }} 
              className="w-full sm:w-auto flex-1 sm:flex-none sm:px-6 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow hover:shadow-md transition-all">
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default ConfirmationModal;