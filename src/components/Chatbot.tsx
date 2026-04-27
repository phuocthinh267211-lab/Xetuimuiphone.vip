import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { MessageCircle, X, Send, Loader2, Bot, User as UserIcon } from 'lucide-react';

interface Message {
  role: 'user' | 'admin';
  text: string;
  time: string;
}

export const Chatbot = ({ user }: { user: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dragControls = useDragControls();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChat = async () => {
    if (!user?.tiktokId) return;
    try {
      const res = await fetch(`/api/chat/${encodeURIComponent(user.tiktokId)}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setUnread(data.unreadUser || 0);
    } catch(e) {}
  };

  useEffect(() => {
    if (isOpen && user?.tiktokId) {
      fetch('/api/chat/read/' + encodeURIComponent(user.tiktokId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user' })
      });
      setUnread(0);
    }
  }, [isOpen, messages.length, user?.tiktokId]);

  useEffect(() => {
    if (!user) return;
    fetchChat();
    const interval = setInterval(fetchChat, 5000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !user?.tiktokId) return;
    
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`/api/chat/${encodeURIComponent(user.tiktokId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', text: input })
      });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // Require login to chat

  return (
    <>
      <motion.button
        drag
        dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 lg:bottom-6 right-6 z-[200] w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-2xl flex items-center justify-center text-white cursor-grab active:cursor-grabbing"
      >
        {unread > 0 && !isOpen && (
           <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold animate-bounce shadow-md">
             {unread}
           </span>
        )}
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-40 lg:bottom-24 right-6 z-[199] w-[350px] max-w-[90vw] h-[500px] max-h-[70vh] bg-[#1e293b] rounded-[2rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            <div 
              className="p-4 bg-black/20 flex items-center gap-3 cursor-grab active:cursor-grabbing shrink-0"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-red-900" />
              </div>
              <div>
                <h4 className="font-black text-white italic tracking-tight">Hỗ Trợ Shop</h4>
                <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest">Admin đang trực tuyến</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 admin-scroll">
              {messages.length === 0 && (
                 <div className="text-center text-slate-500 text-xs mt-4">
                    Gửi tin nhắn để bắt đầu trò chuyện với Admin.
                 </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex items-start gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                      {m.role === 'user' ? <UserIcon className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                   </div>
                   <div className={`p-3 rounded-2xl max-w-[70%] text-sm font-bold ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/10 text-slate-300 rounded-tl-none'}`}>
                      {m.text}
                   </div>
                </div>
              ))}
              {loading && (
                 <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-black/20 border-t border-white/5 flex gap-2 shrink-0">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nhập câu hỏi..."
                className="flex-1 bg-transparent border-white/10 text-white text-sm focus:outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={loading}
                className="bg-yellow-500 text-red-900 p-2 rounded-xl disabled:opacity-50 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
