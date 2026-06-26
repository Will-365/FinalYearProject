import { useCallback, useEffect, useMemo, useState } from 'react';
import { messagingService } from '@/services/messagingService';
import { useAppToast } from '@/hooks/useAppToast';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/components/ui/sheet';
import {
  MessageCircle, Send, Radio, Bell, Search, X, Loader2,
  Megaphone, CheckCheck, Users, AlertTriangle, Gift, Info,
} from 'lucide-react';
import { getInitials } from '@/utils/adminHelpers';

const TYPE_STYLES = {
  info: { icon: Info, bg: 'bg-blue-500', label: 'Info' },
  urgent: { icon: AlertTriangle, bg: 'bg-red-500', label: 'Urgent' },
  reward: { icon: Gift, bg: 'bg-amber-500', label: 'Reward' },
  admin: { icon: Bell, bg: 'bg-purple-500', label: 'Admin' },
  message: { icon: MessageCircle, bg: 'bg-green-500', label: 'Message' },
  system: { icon: Radio, bg: 'bg-slate-500', label: 'System' },
};

function Avatar({ name, className = '' }) {
  return (
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-700 text-sm font-bold text-white shadow-sm ${className}`}>
      {getInitials(name || '?')}
    </div>
  );
}

function UnreadBadge({ count }) {
  if (!count || count <= 0) return null;
  return (
    <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
      {count > 99 ? '99+' : count}
    </span>
  );
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function AdminMessagesPage() {
  const { success, error } = useAppToast();
  const [panel, setPanel] = useState('chats');
  const [broadcasts, setBroadcasts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', body: '', audience: 'all', type: 'info' });
  const [messageForm, setMessageForm] = useState({ recipientId: '', subject: '', body: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bData, nData, iData, cData] = await Promise.all([
        messagingService.getBroadcasts(),
        messagingService.getNotifications({ limit: 50 }),
        messagingService.getMessages({ box: 'inbox', limit: 50 }),
        messagingService.getContacts(),
      ]);
      setBroadcasts(bData.broadcasts || []);
      setNotifications(nData.notifications || []);
      setInbox(iData.messages || []);
      setContacts(cData.contacts || []);
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => { load(); }, [load]);

  const unreadNotifs = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const unreadMsgs = useMemo(() => inbox.filter((m) => !m.readByRecipient).length, [inbox]);
  const totalUnread = unreadNotifs + unreadMsgs;

  const chatItems = useMemo(() => {
    const items = [
      ...inbox.map((m) => ({
        id: m._id,
        kind: 'message',
        title: m.sender?.fullName || 'Unknown',
        subtitle: m.subject,
        preview: m.body,
        time: m.createdAt,
        unread: !m.readByRecipient,
        raw: m,
      })),
      ...notifications.map((n) => ({
        id: n._id,
        kind: 'notification',
        title: n.title,
        subtitle: n.type,
        preview: n.message,
        time: n.createdAt,
        unread: !n.read,
        raw: n,
      })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time));

    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((i) =>
      i.title?.toLowerCase().includes(q) ||
      i.preview?.toLowerCase().includes(q) ||
      i.subtitle?.toLowerCase().includes(q)
    );
  }, [inbox, notifications, search]);

  const markAllRead = async () => {
    await messagingService.markAllNotificationsRead();
    success('All notifications marked as read');
    load();
  };

  const openItem = async (item) => {
    setSelected(item);
    if (item.kind === 'notification' && item.unread) {
      await messagingService.markNotificationRead(item.id);
      setNotifications((prev) => prev.map((n) => (n._id === item.id ? { ...n, read: true } : n)));
    }
    if (item.kind === 'message' && item.unread) {
      await messagingService.markMessageRead(item.id);
      setInbox((prev) => prev.map((m) => (m._id === item.id ? { ...m, readByRecipient: true } : m)));
    }
  };

  const sendBroadcast = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await messagingService.sendBroadcast(broadcastForm);
      success(res.message);
      setBroadcastForm({ title: '', body: '', audience: 'all', type: 'info' });
      setComposeOpen(false);
      setFabOpen(false);
      load();
    } catch (err) {
      error(err.message);
    } finally {
      setSending(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await messagingService.sendMessage(messageForm);
      success('Message sent');
      setMessageForm({ recipientId: '', subject: '', body: '' });
      setComposeOpen(false);
      setFabOpen(false);
      load();
    } catch (err) {
      error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative pb-24">
      {/* Unread banner */}
      {totalUnread > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-3 text-white shadow-lg shadow-green-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{totalUnread} unread {totalUnread === 1 ? 'item' : 'items'}</p>
              <p className="text-xs text-green-100">
                {unreadMsgs > 0 && `${unreadMsgs} message${unreadMsgs > 1 ? 's' : ''}`}
                {unreadMsgs > 0 && unreadNotifs > 0 && ' · '}
                {unreadNotifs > 0 && `${unreadNotifs} notification${unreadNotifs > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <Button size="sm" variant="secondary" className="shrink-0 bg-white/20 text-white hover:bg-white/30 border-0" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d1f13]">Message Center</h2>
          <p className="text-sm text-gray-500">Broadcast alerts and chat with users</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <Button variant={panel === 'chats' ? 'default' : 'outline'} className={panel === 'chats' ? 'bg-green-600 hover:bg-green-700' : ''} onClick={() => setPanel('chats')}>
            <MessageCircle className="h-4 w-4 mr-1" /> Chats <UnreadBadge count={unreadMsgs} />
          </Button>
          <Button variant={panel === 'broadcasts' ? 'default' : 'outline'} className={panel === 'broadcasts' ? 'bg-green-600 hover:bg-green-700' : ''} onClick={() => setPanel('broadcasts')}>
            <Megaphone className="h-4 w-4 mr-1" /> Broadcasts
          </Button>
        </div>
      </div>

      {/* Main chat shell — WhatsApp-inspired */}
      <div className="flex h-[calc(100vh-280px)] min-h-[480px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        {/* Left: conversation list */}
        <div className={`flex w-full flex-col border-r border-gray-100 bg-[#f0f2f5] md:w-[340px] lg:w-[380px] ${selected ? 'hidden md:flex' : 'flex'}`}>
          <div className="bg-gradient-to-r from-[#075e54] to-[#128c7e] px-4 py-4">
            <p className="font-semibold text-white">GreenCare Admin</p>
            <p className="text-xs text-green-100">{contacts.length} contacts · {broadcasts.length} broadcasts sent</p>
          </div>

          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-full border-0 bg-white pl-9 shadow-sm"
              />
            </div>
          </div>

          {/* Mobile panel switch */}
          <div className="flex gap-1 px-3 pb-2 sm:hidden">
            {['chats', 'broadcasts'].map((p) => (
              <button key={p} type="button" onClick={() => setPanel(p)} className={`flex-1 rounded-full py-1.5 text-xs font-semibold capitalize ${panel === p ? 'bg-green-600 text-white' : 'bg-white text-gray-600'}`}>
                {p}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-2 p-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-200" />)}</div>
            ) : panel === 'broadcasts' ? (
              broadcasts.length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-500">No broadcasts yet</p>
              ) : broadcasts.map((b) => {
                const ts = TYPE_STYLES[b.type] || TYPE_STYLES.info;
                const Icon = ts.icon;
                return (
                  <button key={b._id} type="button" onClick={() => setSelected({ kind: 'broadcast', id: b._id, title: b.title, preview: b.body, time: b.createdAt, raw: b })} className={`flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-white ${selected?.id === b._id ? 'bg-white' : ''}`}>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full ${ts.bg} text-white`}><Icon className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <p className="truncate font-semibold text-sm text-gray-900">{b.title}</p>
                        <span className="shrink-0 text-[10px] text-gray-400">{formatTime(b.createdAt)}</span>
                      </div>
                      <p className="truncate text-xs text-gray-500">{b.body}</p>
                      <p className="mt-0.5 text-[10px] text-green-600">{b.recipientCount} recipients · {b.audience}</p>
                    </div>
                  </button>
                );
              })
            ) : chatItems.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500">No messages yet</p>
            ) : chatItems.map((item) => (
              <button
                key={`${item.kind}-${item.id}`}
                type="button"
                onClick={() => openItem(item)}
                className={`flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-white ${selected?.id === item.id ? 'bg-white' : ''}`}
              >
                <Avatar name={item.title} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`truncate text-sm ${item.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{item.title}</p>
                    <span className="shrink-0 text-[10px] text-gray-400">{formatTime(item.time)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`truncate text-xs ${item.unread ? 'font-medium text-gray-700' : 'text-gray-500'}`}>{item.preview}</p>
                    {item.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: detail / empty state */}
        <div className={`flex flex-1 flex-col bg-[#e5ddd5] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1vcGFjaXR5PSIwLjAzIj48cGF0aCBkPSJNMzAgMzBoMzB2MzBIMzB6IiBmaWxsPSIjMDAwIi8+PC9nPjwvc3ZnPg==')] ${!selected ? 'hidden md:flex' : 'flex'}`}>
          {!selected ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/80 shadow-lg">
                <MessageCircle className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700">GreenCare Message Center</h3>
              <p className="mt-2 max-w-sm text-sm text-gray-500">Select a conversation or broadcast from the list, or tap the chat button to compose a new message.</p>
              {totalUnread > 0 && (
                <div className="mt-4 rounded-full bg-green-600 px-4 py-1.5 text-sm font-semibold text-white">
                  {totalUnread} unread waiting
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-gray-200 bg-[#f0f2f5] px-4 py-3">
                <button type="button" className="md:hidden mr-1 text-gray-500" onClick={() => setSelected(null)}><X className="h-5 w-5" /></button>
                <Avatar name={selected.title} className="h-9 w-9 text-xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-sm">{selected.title}</p>
                  <p className="truncate text-xs text-gray-500 capitalize">{selected.kind}{selected.raw?.type ? ` · ${selected.raw.type}` : ''}</p>
                </div>
                <span className="text-xs text-gray-400">{formatTime(selected.time)}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#dcf8c6] px-4 py-3 shadow-sm">
                  {selected.kind === 'message' && selected.raw?.subject && (
                    <p className="mb-1 text-xs font-bold text-green-800">{selected.raw.subject}</p>
                  )}
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{selected.preview}</p>
                  <p className="mt-1 text-right text-[10px] text-gray-500">{formatTime(selected.time)}</p>
                </div>
                {selected.kind === 'broadcast' && selected.raw && (
                  <div className="mx-auto max-w-sm rounded-xl bg-white/90 p-4 text-center shadow-sm">
                    <Users className="mx-auto h-8 w-8 text-green-600 mb-2" />
                    <p className="text-sm font-medium">Sent to {selected.raw.recipientCount} users</p>
                    <p className="text-xs text-gray-500 capitalize">Audience: {selected.raw.audience}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating WhatsApp-style FAB */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {fabOpen && (
          <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl border border-gray-100">
            <button type="button" onClick={() => { setComposeOpen(true); setFabOpen(false); }} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 transition-colors">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-600"><Send className="h-4 w-4" /></span>
              Direct Message
            </button>
            <button type="button" onClick={() => { setComposeOpen(true); setFabOpen(false); }} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-amber-50 transition-colors">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-600"><Megaphone className="h-4 w-4" /></span>
              Broadcast
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setFabOpen((o) => !o)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg shadow-green-300/50 transition-all hover:scale-105 hover:bg-[#20bd5a] active:scale-95"
          aria-label="Open compose menu"
        >
          {fabOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          {!fabOpen && totalUnread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white ring-2 ring-white">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </button>
      </div>

      {/* Compose sheet */}
      <Sheet open={composeOpen} onOpenChange={setComposeOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>New Message</SheetTitle>
          </SheetHeader>
          <form onSubmit={sendMessage} className="mt-4 space-y-4">
            <div><Label>To</Label>
              <Select value={messageForm.recipientId} onValueChange={(v) => setMessageForm((f) => ({ ...f, recipientId: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select user" /></SelectTrigger>
                <SelectContent>{contacts.map((c) => <SelectItem key={c._id} value={c._id}>{c.fullName} ({c.role})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Subject</Label><Input value={messageForm.subject} onChange={(e) => setMessageForm((f) => ({ ...f, subject: e.target.value }))} required className="mt-1" /></div>
            <div><Label>Message</Label><Textarea rows={4} value={messageForm.body} onChange={(e) => setMessageForm((f) => ({ ...f, body: e.target.value }))} required className="mt-1 rounded-2xl" placeholder="Type your message..." /></div>
            <Button type="submit" className="w-full rounded-full bg-[#25d366] hover:bg-[#20bd5a]" disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-2" /> Send</>}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" /><span className="text-xs text-gray-400">OR BROADCAST</span><div className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={sendBroadcast} className="space-y-4">
            <div><Label>Broadcast Title</Label><Input value={broadcastForm.title} onChange={(e) => setBroadcastForm((f) => ({ ...f, title: e.target.value }))} required className="mt-1" /></div>
            <div><Label>Message</Label><Textarea rows={3} value={broadcastForm.body} onChange={(e) => setBroadcastForm((f) => ({ ...f, body: e.target.value }))} required className="mt-1 rounded-2xl" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Audience</Label>
                <Select value={broadcastForm.audience} onValueChange={(v) => setBroadcastForm((f) => ({ ...f, audience: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="residents">Residents</SelectItem>
                    <SelectItem value="collectors">Collectors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Type</Label>
                <Select value={broadcastForm.type} onValueChange={(v) => setBroadcastForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="reward">Reward</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" variant="outline" className="w-full rounded-full border-amber-300 text-amber-700 hover:bg-amber-50" disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Megaphone className="h-4 w-4 mr-2" /> Send Broadcast</>}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
