import React, { useState, useRef, useEffect } from 'react';
import { Property } from '../types';
import { streamChatbotResponse } from '../services/geminiService';
import { BotMessageSquareIcon, SendIcon, XIcon, LoaderIcon } from './icons';

interface ChatbotProps {
  properties: Property[];
}

interface Message {
    role: 'user' | 'model';
    content: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ properties }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    useEffect(() => {
        if(isOpen && messages.length === 0) {
            setMessages([
                { role: 'model', content: "Bonjour ! Je suis votre assistant immobilier. Comment puis-je vous aider à trouver la propriété de vos rêves aujourd'hui ?" }
            ]);
        }
    }, [isOpen, messages.length]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        const historyForAPI = newMessages.slice(0, -1).map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));
        const lastMessageText = userMessage.content;
        
        try {
            const stream = await streamChatbotResponse(properties, historyForAPI, lastMessageText);
            
            let botResponse = '';
            setMessages(prev => [...prev, { role: 'model', content: '' }]);

            for await (const chunk of stream) {
                botResponse += chunk.text;
                setMessages(prev => {
                    const lastMsgIndex = prev.length - 1;
                    const updatedMessages = [...prev];
                    updatedMessages[lastMsgIndex] = { ...updatedMessages[lastMsgIndex], content: botResponse };
                    return updatedMessages;
                });
            }

        } catch (error) {
            console.error("Chatbot error:", error);
            setMessages(prev => [...prev, { role: 'model', content: "Désolé, une erreur s'est produite. Veuillez réessayer." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform hover:scale-110 z-50"
                aria-label="Ouvrir le chatbot"
            >
               {isOpen ? <XIcon className="w-6 h-6"/> : <BotMessageSquareIcon className="w-6 h-6" />}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[90vw] max-w-sm h-[60vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <header className="flex items-center justify-between p-4 bg-indigo-600 text-white rounded-t-2xl">
                        <h3 className="font-bold text-lg">Assistant Immobilier</h3>
                        <button onClick={() => setIsOpen(false)} aria-label="Fermer le chatbot">
                           <XIcon className="w-5 h-5"/>
                        </button>
                    </header>
                    <main className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-xl whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                        {msg.content}
                                        {isLoading && msg.role === 'model' && index === messages.length -1 && !msg.content && <span className="inline-block w-1.5 h-1.5 bg-gray-600 rounded-full ml-1 animate-ping"></span>}
                                    </div>
                                </div>
                            ))}
                             {isLoading && messages[messages.length-1].role === 'user' && (
                                <div className="flex justify-start">
                                    <div className="max-w-[80%] p-3 rounded-xl bg-gray-200 text-gray-800">
                                       <LoaderIcon className="w-5 h-5 animate-spin" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </main>
                    <footer className="p-3 border-t bg-white rounded-b-2xl">
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Posez une question..."
                                className="flex-1 w-full px-4 py-2 bg-gray-100 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={isLoading}
                            />
                            <button onClick={handleSend} disabled={isLoading} className="ml-3 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-300">
                                <SendIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </footer>
                </div>
            )}
        </>
    );
};

export default Chatbot;
