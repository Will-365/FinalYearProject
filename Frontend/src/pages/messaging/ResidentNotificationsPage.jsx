import { useCallback, useEffect, useState } from 'react';
import { messagingService } from '@/services/messagingService';
import { useAppToast } from '@/hooks/useAppToast';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Bell, Send, Inbox, Loader2 } from 'lucide-react';

export function ResidentNotificationsPage() {
  const { success, error } = useAppToast();
  const [notifications, setNotifications] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ recipientId: '', subject: '', body: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nData, iData, cData] = await Promise.all([
        messagingService.getNotifications({ limit: 50 }),
        messagingService.getMessages({ box: 'inbox', limit: 30 }),
        messagingService.getContacts(),
      ]);
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

  const markAllRead = async () => {
    await messagingService.markAllNotificationsRead();
    success('All marked as read');
    load();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await messagingService.sendMessage(form);
      success('Message sent');
      setForm({ recipientId: '', subject: '', body: '' });
      load();
    } catch (err) {
      error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div><h2 className="text-2xl font-bold">Notifications & Messages</h2><p className="text-sm text-gray-500">Stay updated and communicate with admin</p></div>
      <Tabs defaultValue="notifications">
        <TabsList className="grid w-full grid-cols-3 rounded-xl">
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-1" />Notifications</TabsTrigger>
          <TabsTrigger value="inbox"><Inbox className="h-4 w-4 mr-1" />Inbox</TabsTrigger>
          <TabsTrigger value="send"><Send className="h-4 w-4 mr-1" />Send</TabsTrigger>
        </TabsList>
        <TabsContent value="notifications" className="mt-4">
          <div className="flex justify-end mb-3"><Button variant="outline" size="sm" onClick={markAllRead}>Mark all read</Button></div>
          {loading ? <CardSkeleton count={4} /> : notifications.length === 0 ? <p className="text-center py-12 text-gray-500">No notifications</p> : (
            <div className="space-y-2">{notifications.map((n) => (
              <div key={n._id} className={`rounded-2xl border p-4 ${n.read ? 'bg-white' : 'bg-green-50 border-green-200'}`}>
                <p className="font-semibold text-sm">{n.title}</p>
                <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            ))}</div>
          )}
        </TabsContent>
        <TabsContent value="inbox" className="mt-4">
          {loading ? <CardSkeleton count={3} /> : inbox.length === 0 ? <p className="text-gray-500 text-sm">No messages</p> : inbox.map((m) => (
            <div key={m._id} className="rounded-2xl border p-4 mb-2 bg-white">
              <p className="font-semibold">{m.subject}</p>
              <p className="text-xs text-gray-500">From {m.sender?.fullName}</p>
              <p className="text-sm mt-2">{m.body}</p>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="send" className="mt-4">
          <form onSubmit={sendMessage} className="rounded-2xl border bg-white p-6 space-y-4">
            <div><Label>To</Label>
              <Select value={form.recipientId} onValueChange={(v) => setForm((f) => ({ ...f, recipientId: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select contact" /></SelectTrigger>
                <SelectContent>{contacts.map((c) => <SelectItem key={c._id} value={c._id}>{c.fullName} ({c.role})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} required className="mt-1" /></div>
            <div><Label>Message</Label><Textarea rows={4} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} required className="mt-1" /></div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={sending}>{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}</Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
