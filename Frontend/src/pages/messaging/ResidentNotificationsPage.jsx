import { useCallback, useEffect, useState, useRef } from 'react';
import { messagingService } from '@/services/messagingService';
import { useAppToast } from '@/hooks/useAppToast';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Bell, Send, MessageSquare, Loader2, Search, CheckCircle2, Check } from 'lucide-react';

export function ResidentNotificationsPage() {
  const { success, error } = useAppToast();
  const [activeTab, setActiveTab] = useState('chats');
  const [activeContactId, setActiveContactId] = useState(null);
  
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [body, setBody] = useState('');
  const [search, setSearch] = useState('');
  
  const messagesEndRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [nData, iData, sData, cData] = await Promise.all([
        messagingService.getNotifications({ limit: 50 }),
        messagingService.getMessages({ box: 'inbox', limit: 100 }),
        messagingService.getMessages({ box: 'sent', limit: 100 }),
        messagingService.getContacts(),
      ]);
      setNotifications(nData.notifications || []);
      
      const allMessages = [...(iData.messages || []), ...(sData.messages || [])];
      // Deduplicate by ID just in case
      const uniqueMessages = Array.from(new Map(allMessages.map(m => [m._id, m])).values());
      // Sort ascending by time
      uniqueMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      setMessages(uniqueMessages);
      setContacts(cData.contacts || []);
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => { load(); }, [load]);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeContactId]);

  const markAllRead = async () => {
    await messagingService.markAllNotificationsRead();
    success('All marked as read');
    load();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!body.trim() || !activeContactId) return;
    
    setSending(true);
    try {
      // Use "Message" as subject since we don't want to duplicate it in a chat UI
      await messagingService.sendMessage({
        recipientId: activeContactId,
        subject: "Message",
        body: body.trim()
      });
      setBody('');
      load();
    } catch (err) {
      error(err.message);
    } finally {
      setSending(false);
    }
  };
  
  const markAsRead = async (messageId) => {
    try {
      await messagingService.markMessageRead(messageId);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  // Group messages by contact
  const chatList = contacts.map(contact => {
    const contactMessages = messages.filter(m => m.sender?._id === contact._id || m.recipient?._id === contact._id);
    const lastMessage = contactMessages.length > 0 ? contactMessages[contactMessages.length - 1] : null;
    const unreadCount = contactMessages.filter(m => m.sender?._id === contact._id && !m.readByRecipient).length;
    
    return {
      ...contact,
      lastMessage,
      unreadCount,
      messages: contactMessages
    };
  }).filter(c => c.lastMessage || c.role === 'admin'); // Only show contacts we've chatted with or admins we can start chatting with

  const filteredList = chatList.filter(c => c.fullName.toLowerCase().includes(search.toLowerCase()));
  
  const activeChat = chatList.find(c => c._id === activeContactId);

  return (
    <div className="flex h-[calc(100vh-140px)] border rounded-2xl overflow-hidden bg-white shadow-sm max-w-6xl mx-auto">
      {/* LEFT SIDEBAR */}
      <div className="w-80 flex-shrink-0 border-r bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <h2 className="text-xl font-bold mb-4">Messages</h2>
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button 
              onClick={() => setActiveTab('chats')} 
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${activeTab === 'chats' ? 'bg-white shadow text-green-700' : 'text-gray-500'}`}
            >
              <div className="flex items-center justify-center gap-1">
                <MessageSquare className="h-4 w-4" /> Chats
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('notifications')} 
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${activeTab === 'notifications' ? 'bg-white shadow text-green-700' : 'text-gray-500'}`}
            >
              <div className="flex items-center justify-center gap-1">
                <Bell className="h-4 w-4" /> Alerts
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 ml-1"></span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            </div>
          ) : activeTab === 'chats' ? (
            <div>
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search chats..." 
                    className="pl-9 h-9 text-sm bg-white" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {filteredList.length === 0 ? (
                  <p className="p-6 text-center text-sm text-gray-500">No conversations found</p>
                ) : filteredList.map(contact => (
                  <div 
                    key={contact._id} 
                    onClick={() => {
                      setActiveContactId(contact._id);
                      // Mark unread messages as read
                      contact.messages
                        .filter(m => m.sender?._id === contact._id && !m.readByRecipient)
                        .forEach(m => markAsRead(m._id));
                    }}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-100 ${activeContactId === contact._id ? 'bg-green-50/50' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-gray-900 truncate pr-2">{contact.fullName}</h4>
                      {contact.lastMessage && (
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {new Date(contact.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500 truncate pr-2">
                        {contact.lastMessage ? contact.lastMessage.body : <span className="italic">Start a conversation</span>}
                      </p>
                      {contact.unreadCount > 0 && (
                        <Badge className="bg-green-600 text-white flex-shrink-0 px-1.5 min-w-[20px] text-center">
                          {contact.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <div className="flex justify-end mb-2">
                <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs h-7 text-green-700">Mark all read</Button>
              </div>
              {notifications.length === 0 ? (
                <p className="text-center py-8 text-sm text-gray-500">No system alerts</p>
              ) : notifications.map((n) => (
                <div key={n._id} className={`rounded-xl border p-4 ${n.read ? 'bg-white' : 'bg-green-50 border-green-200'}`}>
                  <p className="font-semibold text-sm text-gray-900">{n.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT CHAT PANE */}
      <div className="flex-1 flex flex-col bg-[#efeae2] relative">
        {/* Chat Background Pattern */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

        {activeTab !== 'chats' || !activeContactId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 z-10">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <MessageSquare className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">GreenCare Messaging</h3>
            <p className="text-gray-500 max-w-sm">Select a contact from the left sidebar to start chatting with our support team or administration.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 border-b bg-white flex items-center justify-between z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                  {activeChat?.fullName?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{activeChat?.fullName}</h3>
                  <p className="text-xs text-green-600 capitalize">{activeChat?.role}</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 z-10">
              {activeChat?.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-lg shadow-sm text-sm text-gray-600 text-center max-w-xs">
                    This is the beginning of your conversation with {activeChat.fullName}.
                  </div>
                </div>
              ) : (
                activeChat?.messages.map((m, idx) => {
                  const isMine = m.sender?._id !== activeContactId;
                  // Skip displaying redundant subject lines if they match the body or are just "Message"
                  const showSubject = m.subject && m.subject !== 'Message' && m.subject !== m.body;
                  
                  return (
                    <div key={m._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm relative ${isMine ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                        {showSubject && <p className="font-semibold text-sm mb-1">{m.subject}</p>}
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{m.body}</p>
                        
                        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-500">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMine && (
                            <span className="ml-1">
                              {m.readByRecipient ? <CheckCircle2 className="h-3 w-3 text-blue-500" /> : <Check className="h-3 w-3" />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t z-10">
              <form onSubmit={sendMessage} className="flex gap-2 max-w-4xl mx-auto">
                <Input 
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 h-12 bg-gray-50 border-transparent focus-visible:ring-1 focus-visible:ring-green-500 rounded-full px-6"
                />
                <Button 
                  type="submit" 
                  disabled={sending || !body.trim()}
                  className="h-12 w-12 rounded-full bg-green-600 hover:bg-green-700 flex-shrink-0 p-0 flex items-center justify-center"
                >
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
