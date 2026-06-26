import { useCallback, useEffect, useMemo, useState } from 'react';
import { collectorService } from '@/services/collectorService';
import { useAppToast } from '@/hooks/useAppToast';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/components/ui/sheet';
import {
  MessageCircle, Send, Bell, Search, X, Loader2, CheckCheck,
  AlertTriangle, Gift, Info, Radio,
} from 'lucide-react';
import { getInitials } from '@/utils/adminHelpers';

const TYPE_STYLES = {
  info: { icon: Info, bg: 'bg-blue-500' },
  urgent: { icon: AlertTriangle, bg: 'bg-red-500' },
  reward: { icon: Gift, bg: 'bg-amber-500' },
  status: { icon: Bell, bg: 'bg-purple-500' },
  message: { icon: MessageCircle, bg: 'bg-green-500' },
  system: { icon: Radio, bg: 'bg-slate-500' },
};

function Avatar({ name, className = '' }) {
  return (
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-700 text-sm font-bold text-white shadow-sm ${className}`}>
      {getInitials(name || '?')}
    </div>
  );
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function CollectorMessagesPage() {
  const { success, error } = useAppToast();
  const [notifications, setNotifications] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [contacts, setContacts] = useState({ admins: [], residents: [] });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [form, setForm] = useState({ recipientId: '', subject: '', body: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nData, iData, cData] = await Promise.all([
        collectorService.getNotifications({ limit: 50 }),
        collectorService.getMessages({ box: 'inbox', limit: 50 }),
        collectorService.getContacts(),
      ]);
      setNotifications(nData.notifications || []);
      setInbox(iData.messages || []);
      setContacts(cData || { admins: [], residents: [] });
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const interval = setInterval(() => load(), 15000);
    return () => clearInterval(interval);
  }, [load]);

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
      i.preview?.toLowerCase().includes(q)
    );
  }, [inbox, notifications, search]);

  const allContacts = useMemo(() => [
    ...(contacts.admins || []).map((c) => ({ ...c, label: `${c.fullName} (Admin)` })),
    ...(contacts.residents || []).map((c) => ({ ...c, label: `${c.fullName} (Resident)` })),
  ], [contacts]);

  const markAllRead = async () => {
    await collectorService.markAllNotificationsRead();
    success('All notifications marked as read');
    load();
  };

  const openItem = async (item) => {
    setSelected(item);
    if (item.kind === 'notification' && item.unread) {
      await collectorService.markNotificationRead(item.id);
      setNotifications((prev) => prev.map((n) => (n._id === item.id ? { ...n, read: true } : n)));
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!form.recipientId || !form.subject.trim() || !form.body.trim()) return;
    setSending(true);
    try {
      await collectorService.sendMessage(form);
      success('Message sent');
      setForm({ recipientId: '', subject: '', body: '' });
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
    <div className="relative pb-24 max-w-6xl mx-auto">
      {totalUnread > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-3 text-white shadow-lg shadow-green-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{totalUnread} unread {totalUnread === 1 ? 'item' : 'items'}</p>
              <p className="text-xs text-green-100">
                {unreadMsgs > 0 && `${unreadMsgs} message${unreadMsgs > 1 ? 's' : ''}`}
                {unreadMsgs > 0 && unreadNotifs > 0 && ' · '}
                {unreadNotifs > 0 && `${unreadNotifs} alert${unreadNotifs > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <Button size="sm" variant="secondary" className="shrink-0 bg-white/20 text-white hover:bg-white/30 border-0" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-2xl font-bold text-[#0d1f13]">Message Center</h2>
        <p className="text-sm text-gray-500">Admin alerts, assignments, and direct messages</p>
      </div>

      <div className="flex h-[calc(100vh-280px)] min-h-[480px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className={`flex w-full flex-col border-r border-gray-100 bg-[#f0f2f5] md:w-[340px] lg:w-[380px] ${selected ? 'hidden md:flex' : 'flex'}`}>
          <div className="bg-gradient-to-r from-[#075e54] to-[#128c7e] px-4 py-4">
            <p className="font-semibold text-white">GreenCare Collector</p>
            <p className="text-xs text-green-100">{allContacts.length} contacts · {notifications.length} alerts</p>
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

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-2 p-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-200" />)}</div>
            ) : chatItems.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500">No messages yet</p>
            ) : chatItems.map((item) => {
              const ts = TYPE_STYLES[item.raw?.type] || TYPE_STYLES.message;
              const TypeIcon = ts.icon;
              return (
                <button
                  key={`${item.kind}-${item.id}`}
                  type="button"
                  onClick={() => openItem(item)}
                  className={`flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-white ${selected?.id === item.id ? 'bg-white' : ''}`}
                >
                  {item.kind === 'notification' ? (
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full ${ts.bg} text-white`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                  ) : (
                    <Avatar name={item.title} />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-sm ${item.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{item.title}</p>
                      <span className="shrink-0 text-[10px] text-gray-400">{formatTime(item.time)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-xs ${item.unread ? 'font-medium text-gray-700' : 'text-gray-500'}`}>
                        {item.kind === 'message' && item.subtitle ? `${item.subtitle}: ` : ''}{item.preview}
                      </p>
                      {item.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className={`flex flex-1 flex-col bg-[#e5ddd5] ${!selected ? 'hidden md:flex' : 'flex'}`}>
          {!selected ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/80 shadow-lg">
                <MessageCircle className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700">Collector Inbox</h3>
              <p className="mt-2 max-w-sm text-sm text-gray-500">Select a message or alert, or tap the green button to compose.</p>
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
              <div className="flex-1 overflow-y-auto p-4">
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#dcf8c6] px-4 py-3 shadow-sm">
                  {selected.kind === 'message' && selected.raw?.subject && (
                    <p className="mb-1 text-xs font-bold text-green-800">{selected.raw.subject}</p>
                  )}
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{selected.preview}</p>
                  <p className="mt-1 text-right text-[10px] text-gray-500">{formatTime(selected.time)}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {fabOpen && (
          <div className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl border border-gray-100">
            <button type="button" onClick={() => { setComposeOpen(true); setFabOpen(false); }} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-600"><Send className="h-4 w-4" /></span>
              New Message
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setFabOpen((o) => !o)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg hover:scale-105 transition-transform"
        >
          {fabOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          {!fabOpen && totalUnread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white ring-2 ring-white">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </button>
      </div>

      <Sheet open={composeOpen} onOpenChange={setComposeOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader><SheetTitle>New Message</SheetTitle></SheetHeader>
          <form onSubmit={sendMessage} className="mt-4 space-y-4">
            <div>
              <Label>To</Label>
              <Select value={form.recipientId} onValueChange={(v) => setForm((f) => ({ ...f, recipientId: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select recipient" /></SelectTrigger>
                <SelectContent>
                  {allContacts.map((c) => (
                    <SelectItem key={c._id || c.id} value={c._id || c.id}>{c.label || c.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} required className="mt-1" /></div>
            <div><Label>Message</Label><Textarea rows={4} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} required className="mt-1 rounded-2xl" placeholder="Type your message..." /></div>
            <Button type="submit" className="w-full rounded-full bg-[#25d366] hover:bg-[#20bd5a]" disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-2" /> Send</>}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
