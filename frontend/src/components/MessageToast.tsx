import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface MessageToastProps {
  message: { type: 'success' | 'error'; text: string } | null;
  onClose: () => void;
}

const MessageToast: React.FC<MessageToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center space-x-3 animate-slide-in ${
      message.type === 'success' 
        ? 'bg-linear-to-r from-green-500 to-green-600' 
        : 'bg-linear-to-r from-red-500 to-red-600'
    } text-white`}>
      {message.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
      <span className="font-medium">{message.text}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MessageToast;