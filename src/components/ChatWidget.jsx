import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, MessageCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import { API_BASE } from '../lib/apiConfig';

export default function ChatWidget({ booking, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Quick negotiation prompt suggestions based on role
  const quickPrompts = currentUser.role === 'exporter' ? [
    'Can you offer ₹400/CBM on this route?',
    'Is departure strictly guaranteed on schedule?',
    'Cargo packaging is complete and ready for pickup.'
  ] : [
    'Rate confirmed at requested volume.',
    'Loading slot confirmed at port bay 4.',
    'Please ensure Commercial Invoice is uploaded.'
  ];

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch initial message history from backend REST API
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/messages/${booking.id}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.status === 'success' && Array.isArray(json.data)) {
            setMessages(json.data);
          }
        }
      } catch (err) {
        console.warn('[ChatWidget] Could not fetch message history:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHistory();

    // 2. Connect to the backend Socket.io server
    const newSocket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      if (isMounted) setIsConnected(true);
      // Join the specific room for this booking
      newSocket.emit('join_booking', booking.id);
    });

    newSocket.on('disconnect', () => {
      if (isMounted) setIsConnected(false);
    });

    // Listen for history delivered over socket on join
    newSocket.on('chat_history', (history) => {
      if (isMounted && Array.isArray(history) && history.length > 0) {
        setMessages((prev) => {
          const map = new Map();
          [...prev, ...history].forEach((m) => {
            const key = m.id || `${m.senderName}-${m.time}-${m.text}`;
            map.set(key, m);
          });
          return Array.from(map.values()).sort(
            (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
          );
        });
      }
    });

    // Listen for incoming messages from either party
    newSocket.on('receive_message', (messageData) => {
      if (isMounted) {
        setMessages((prev) => {
          // Avoid duplicate messages
          if (prev.some((m) => m.id === messageData.id)) {
            return prev;
          }
          return [...prev, messageData];
        });
      }
    });

    return () => {
      isMounted = false;
      newSocket.disconnect();
    };
  }, [booking.id]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const text = typeof textToSend === 'string' ? textToSend : newMessage;
    if (!text || !text.trim()) return;

    const messageData = {
      id: `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      bookingId: booking.id,
      text: text.trim(),
      senderName: currentUser.name || (currentUser.role === 'carrier' ? 'Carrier' : 'Exporter'),
      role: currentUser.role, // 'exporter' or 'carrier'
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };

    // Optimistic UI update so sender sees their message immediately
    setMessages((prev) => {
      if (prev.some((m) => m.id === messageData.id)) return prev;
      return [...prev, messageData];
    });
    setNewMessage('');

    // Emit to socket room for real-time delivery to the counterparty
    if (socket && socket.connected) {
      socket.emit('send_message', messageData);
    }

    // Persist to backend database / memory via REST API as a resilient guarantee
    try {
      await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });
    } catch (err) {
      console.warn('[ChatWidget] Failed to save message via REST:', err);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-8 duration-300">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-indigo-700 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-tight">Negotiation Chat</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isConnected ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' : 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1 ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                {isConnected ? 'Live' : 'Connecting'}
              </span>
            </div>
            <p className="text-xs text-brand-100 opacity-90 truncate max-w-[200px]">
              {booking.id} • {booking.route || 'Cargo Negotiation'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role Banner */}
      <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1.5 font-medium">
          <User className="w-3.5 h-3.5 text-brand-600" />
          You: <strong className="text-slate-800 capitalize">{currentUser.name || currentUser.role}</strong>
        </span>
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-700">
          {currentUser.role}
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 h-80 overflow-y-auto bg-slate-50 flex flex-col gap-3">
        {isLoading ? (
          <div className="flex justify-center items-center my-auto">
            <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-400 my-auto text-sm px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-300">
              <MessageCircle className="w-6 h-6" />
            </div>
            <p className="font-semibold text-slate-600">No messages yet</p>
            <p className="text-xs text-slate-400 mt-1">Both Exporter and Carrier can chat and negotiate rates in real-time here.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.role === currentUser.role;
            return (
              <div key={msg.id} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-bold text-slate-600">
                    {msg.senderName}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                    msg.role === 'exporter' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {msg.role}
                  </span>
                  <span className="text-[9px] text-slate-400">{msg.time}</span>
                </div>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  isMe 
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-tr-xs' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Negotiation Chips */}
      <div className="px-3 py-2 bg-slate-100/50 border-t border-slate-100 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-brand-400 hover:bg-brand-50 text-slate-600 transition-colors shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-3 bg-white border-t border-slate-100 flex gap-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message as ${currentUser.role}...`} 
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-500 focus:bg-white transition-colors"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()} 
          className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-brand-500/20"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>
    </div>
  );
}
