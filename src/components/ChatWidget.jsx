import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User } from 'lucide-react';
import { io } from 'socket.io-client';

export default function ChatWidget({ booking, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Connect to the backend Socket.io server
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Join the specific room for this booking
    newSocket.emit('join_booking', booking.id);

    // Listen for incoming messages
    newSocket.on('receive_message', (messageData) => {
      setMessages((prev) => [...prev, messageData]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [booking.id]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      id: Date.now().toString(),
      bookingId: booking.id,
      text: newMessage,
      senderName: currentUser.name || currentUser.role,
      role: currentUser.role, // 'exporter' or 'carrier'
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Emit to server
    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-8">
      {/* Header */}
      <div className="bg-brand-600 text-white p-4 flex justify-between items-center">
        <div>
          <h3 className="font-bold">Negotiation Chat</h3>
          <p className="text-xs text-brand-100 opacity-90">Booking: {booking.id}</p>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 h-80 overflow-y-auto bg-slate-50 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 my-auto text-sm">
            <p>No messages yet.</p>
            <p>Start negotiating the rate or terms!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.role === currentUser.role;
            return (
              <div key={msg.id} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                <span className="text-[10px] text-slate-400 mb-1 px-1">{msg.senderName} • {msg.time}</span>
                <div className={`px-4 py-2 rounded-2xl ${isMe ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..." 
          className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none focus:border-brand-500 focus:bg-white transition-colors"
        />
        <button type="submit" disabled={!newMessage.trim()} className="w-10 h-10 bg-brand-600 text-white rounded-full flex items-center justify-center hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>
    </div>
  );
}
