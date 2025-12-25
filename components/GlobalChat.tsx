
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Volume2 } from 'lucide-react';
import { globalChatResponse, generateSpeech } from '../services/geminiService';
import { ChatMessage, UserProfile } from '../types';
import { mockBackend } from '../services/mockBackend';

interface GlobalChatProps {
  currentUser: UserProfile | null;
}

const GlobalChat: React.FC<GlobalChatProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    // Lead Capsule Implementation: Capture on first question for non-admins
    if (!leadCaptured && (!currentUser || currentUser.role === 'VISITOR' || currentUser.role === 'JOINED')) {
        const userId = currentUser?.id || mockBackend.getCurrentSessionId();
        const userIp = currentUser?.ip || "unknown";
        const userLoc = currentUser?.location || { city: 'Unknown', country: 'Global', lat: 0, lng: 0, flag: '🌐' };
        const device = currentUser?.device || (navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop');

        mockBackend.captureLead({
            userId,
            name: currentUser?.name || 'Anonymous Visitor',
            email: currentUser?.email || 'unassigned@lead.internal',
            firstQuery: userMsg,
            location: userLoc,
            device,
            ip: userIp
        });
        setLeadCaptured(true);
    }

    try {
      const response = await globalChatResponse(userMsg, history);
      setHistory(prev => [...prev, { role: 'model', text: response || "I couldn't think of a response." }]);
    } catch (e) {
      setHistory(prev => [...prev, { role: 'model', text: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (text: string) => {
      const buffer = await generateSpeech(text);
      if (buffer) {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start(0);
      }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[150] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 h-[500px] bg-[#0a0a0a] border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white text-sm">Curious Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>

          {/* Chat Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/80">
            {history.length === 0 && (
                <div className="text-center text-gray-500 text-xs mt-10">
                    Ask me anything about the platform or your learning journey!
                </div>
            )}
            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-cyan-700 text-white' : 'bg-white/10 text-gray-200'}`}>
                  {msg.text}
                  {msg.role === 'model' && (
                      <button onClick={() => playAudio(msg.text)} className="ml-2 opacity-50 hover:opacity-100 align-bottom"><Volume2 className="w-3 h-3" /></button>
                  )}
                </div>
              </div>
            ))}
            {loading && <div className="text-gray-500 text-xs ml-2 animate-pulse">Thinking...</div>}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-[#0a0a0a] flex gap-2">
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-cyan-500/50"
            />
            <button type="submit" disabled={loading} className="p-2 bg-cyan-600 rounded-lg hover:bg-cyan-500 disabled:opacity-50">
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-110 transition-transform group"
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageSquare className="w-6 h-6 text-white group-hover:animate-bounce" />}
      </button>
    </div>
  );
};

export default GlobalChat;
