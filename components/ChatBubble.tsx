
import React from 'react';
import { ChatMessage } from '../types';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
        isUser 
          ? 'bg-indigo-600 text-white rounded-tr-none' 
          : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
      }`}>
        <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
          {message.text}
        </p>
      </div>
    </div>
  );
};
