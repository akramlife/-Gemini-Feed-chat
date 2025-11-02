
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { SendIcon, SpinnerIcon } from './icons';

interface ChatViewProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    if (isSystem) {
        return (
            <div className="px-4 py-2 text-xs text-center text-gray-500 dark:text-gray-400">
                {message.content}
            </div>
        );
    }
    
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-xs md:max-w-md lg:max-w-2xl px-4 py-2 rounded-2xl ${
                    isUser
                        ? 'bg-blue-500 text-white rounded-br-lg'
                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-lg'
                }`}
            >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
        </div>
    );
};

export const ChatView: React.FC<ChatViewProps> = ({ messages, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="max-w-xs px-4 py-3 rounded-2xl bg-white dark:bg-gray-700 rounded-bl-lg flex items-center space-x-2">
                             <SpinnerIcon className="w-5 h-5 animate-spin text-gray-500 dark:text-gray-400"/>
                             <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="sticky bottom-0 left-0 right-0 p-2 sm:p-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about the feed..."
                        className="flex-1 w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};
