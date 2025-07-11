
import React from 'react';
import type { ModalMessage } from '../../types';

interface MessageModalProps extends ModalMessage {
    onClose: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({ show, title, content, type, onClose }) => {
    if (!show) return null;
    let titleColor = 'text-blue-400', icon = 'ℹ️';
    if (type === 'error') { titleColor = 'text-red-400'; icon = '⚠️'; } 
    else if (type === 'success') { titleColor = 'text-green-400'; icon = '✅'; }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[120]"> 
        <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">{icon}</span>
            <h3 className={`text-xl font-semibold ${titleColor}`}>{title}</h3>
          </div>
          <p className="text-gray-300 mb-6 whitespace-pre-line">{content}</p>
          <button onClick={onClose} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow hover:shadow-md transition-all">
            Đã hiểu
          </button>
        </div>
      </div>
    );
};

export default MessageModal;