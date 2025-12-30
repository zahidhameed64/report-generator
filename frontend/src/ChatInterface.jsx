import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatInterface = ({ stats }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !stats) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare history for backend (excluding current message as it's added in backend prompt logic or we send it here)
            // Let's send the full history including the new user message for simplicity if backend expects it
            // Backend logic I wrote expects: history list of {role, content}

            const payload = {
                stats: stats,
                history: [...messages, userMessage]
            };

            const response = await fetch('http://127.0.0.1:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error answering that." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-purple-50 overflow-hidden mt-8 animate-slide-up">
            <div className="bg-purple-50 p-4 border-b border-purple-100 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-gray-800">Chat with your Data</h3>
            </div>

            <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        <Bot className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>Ask me anything about your data!</p>
                        <p className="text-sm mt-2">"Why are earnings high?" • "What is the trend?"</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                                ? 'bg-purple-600 text-white rounded-tr-sm'
                                : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-sm'
                            }`}>
                            <div className="flex items-center gap-2 mb-1 opacity-75 text-xs">
                                {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                <span className="uppercase tracking-wider font-bold">{msg.role}</span>
                            </div>
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm p-4">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask a follow-up question..."
                        className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
