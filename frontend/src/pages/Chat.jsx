import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';
import { Send, MessageSquare, Phone, User, Check, CheckCheck, ArrowLeft } from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  // Load conversations list
  const loadConversations = async () => {
    try {
      const res = await chatAPI.getConversations();
      if (res.success) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for active conversation
  const loadMessages = async (conversationId) => {
    try {
      const res = await chatAPI.getMessages(conversationId);
      if (res.success) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Poll conversations & active messages
  useEffect(() => {
    const pollInterval = setInterval(() => {
      loadConversations();
      if (activeConversation) {
        loadMessages(activeConversation._id);
      }
    }, 5000); // Poll every 5s

    return () => clearInterval(pollInterval);
  }, [activeConversation]);

  // Scroll to bottom when messages load
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    loadMessages(conv._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const messageText = inputText.trim();
    setInputText('');

    try {
      const res = await chatAPI.sendMessage({
        conversationId: activeConversation._id,
        text: messageText
      });
      if (res.success) {
        setMessages([...messages, res.data]);
        loadConversations(); // refresh lastMessage on sidebar
      }
    } catch (err) {
      alert('Failed to send message');
    }
  };

  const getPartnerUser = (conv) => {
    if (!user || !conv.participants) return null;
    return conv.participants.find(p => p._id !== user.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 h-[calc(100vh-5rem)] md:h-[82vh] flex flex-col">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-1 shadow-sm">
        
        {/* Left Sidebar Conversations List */}
        <div className={`w-full md:w-1/3 border-r flex flex-col bg-gray-50/50 ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3.5 sm:p-4 border-b bg-white">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">StaySync Inbox</h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-150">
            {loading ? (
              <p className="text-xs text-gray-400 text-center py-6">Loading conversations...</p>
            ) : conversations.length > 0 ? (
              conversations.map((conv) => {
                const partner = getPartnerUser(conv);
                if (!partner) return null;
                const isSelected = activeConversation?._id === conv._id;

                return (
                  <div
                    key={conv._id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-3.5 sm:p-4 cursor-pointer transition-colors flex items-start gap-3 select-none hover:bg-gray-100 ${isSelected ? 'bg-white border-l-4 border-green-600' : ''}`}
                  >
                    <img
                      src={partner.profileImage}
                      alt={partner.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 border"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-xs font-bold text-gray-800 truncate">{partner.name}</h4>
                        <span className="text-[9px] text-gray-400 font-medium">
                          {new Date(conv.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                        {partner.role === 'USER' ? 'Tenant' : 'Owner/Provider'}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">{conv.lastMessage || 'Start a conversation...'}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs">No active chat threads.</p>
                <p className="text-[10px] mt-1 text-gray-400">Connect with stay owners or meal providers to start chat threads.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Active Message Thread */}
        <div className={`w-full md:w-2/3 flex-1 flex flex-col bg-white ${activeConversation ? 'flex' : 'hidden md:flex'}`}>
          {activeConversation ? (
            <>
              {/* Thread Header */}
              {(() => {
                const partner = getPartnerUser(activeConversation);
                return (
                  <div className="p-3 sm:p-4 border-b flex items-center justify-between shadow-sm shrink-0">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveConversation(null)}
                        className="md:hidden p-1.5 -ml-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Back to Inbox"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <img
                        src={partner?.profileImage}
                        alt="Partner"
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border"
                      />
                      <div>
                        <h3 className="font-bold text-gray-800 text-xs sm:text-sm leading-tight">{partner?.name}</h3>
                        <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">{partner?.role}</span>
                      </div>
                    </div>

                    {partner?.phone && (
                      <a
                        href={`tel:${partner.phone}`}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                        title="Call Provider"
                      >
                        <Phone className="w-4 h-4 text-green-600" />
                        <span className="text-gray-600 hidden sm:inline">{partner.phone}</span>
                      </a>
                    )}
                  </div>
                );
              })()}

              {/* Chat Messages Log */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/30">
                {messages.map((msg) => {
                  const isOwnMessage = msg.sender?._id === user.id || msg.sender === user.id;

                  return (
                    <div key={msg._id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-xl px-4 py-2.5 shadow-xs text-xs ${isOwnMessage ? 'bg-green-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-150 rounded-bl-none'}`}>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        <span className={`text-[8px] mt-1 block text-right font-medium ${isOwnMessage ? 'text-green-200' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Footer */}
              <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2 shrink-0 bg-white">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-green-500 focus:outline-none"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1 shadow-sm transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/10">
              <MessageSquare className="w-16 h-16 text-gray-200 mb-2" />
              <p className="text-sm font-semibold">Select a conversation thread to begin messaging</p>
              <p className="text-xs mt-1 text-gray-400">You can message property owners or service providers directly from marketplace listings.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Chat;
