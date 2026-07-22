import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { adminAddressService, adminCollectorService } from '@/services/adminService';
import { useToast } from '@/hooks/useToast';
import { AddressNodeModal } from '@/app/components/admin/AddressNodeModal';
import { AdminCollectionSchedules } from '@/app/components/admin/AdminCollectionSchedules';
import { ChevronDown, ChevronRight, MapPin, Plus, UserCheck, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

const PROVINCES = ['Kigali City', 'Northern Province', 'Southern Province', 'Eastern Province', 'Western Province'];

function TreeNode({ node, level = 0, onAdd, onEdit, onAssign }: any) {
  const [open, setOpen] = useState(level < 2);
  const children = node.children || [];
  const hasChildren = children.length > 0;
  const collectorName = node.assignedCollector?.fullName || (typeof node.assignedCollector === 'string' ? 'Assigned' : null);

  return (
    <div className={`${level > 0 ? 'ml-4 border-l border-gray-100 pl-3' : ''}`}>
      <div className="flex items-center gap-2 py-2 group">
        <button type="button" onClick={() => setOpen(!open)} className="p-0.5">
          {hasChildren ? (open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : <span className="w-4" />}
        </button>
        <MapPin className="h-4 w-4 text-green-600 shrink-0" />
        <span className="font-medium text-sm flex-1">{node.name}</span>
        {node.collectionDays?.length > 0 && (
          <div className="hidden sm:flex gap-1">
            {node.collectionDays.slice(0, 3).map((d: string) => (
              <span key={d} className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] capitalize text-green-700">{d.slice(0, 3)}</span>
            ))}
          </div>
        )}
        <span className="text-xs text-gray-400 hidden md:inline">{collectorName || 'Unassigned'}</span>
        {!node.isActive && node.isActive === false && <Badge variant="outline" className="text-xs">Inactive</Badge>}
        <div className="opacity-0 group-hover:opacity-100 flex gap-1">
          {node._id && <button type="button" onClick={() => onEdit(node)} className="p-1 hover:bg-gray-100 rounded"><Pencil className="h-3 w-3" /></button>}
          <button type="button" onClick={() => onAdd(node, level)} className="p-1 hover:bg-gray-100 rounded"><Plus className="h-3 w-3" /></button>
          {node._id && <button type="button" onClick={() => onAssign(node)} className="p-1 hover:bg-gray-100 rounded"><UserCheck className="h-3 w-3" /></button>}
        </div>
      </div>
      {open && children.map((child: any, i: number) => (
        <TreeNode key={child._id || child.name || i} node={child} level={level + 1} onAdd={onAdd} onEdit={onEdit} onAssign={onAssign} />
      ))}
    </div>
  );
}

export function AdminZoneManagement() {
  const { showToast } = useToast();
  const [province, setProvince] = useState('Kigali City');
  const [tree, setTree] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editNode, setEditNode] = useState<any>(null);
  const [parentContext, setParentContext] = useState<any>(null);
  const [assignNode, setAssignNode] = useState<any>(null);
  const [collectors, setCollectors] = useState<any[]>([]);
  const [selectedCollector, setSelectedCollector] = useState('');

  const loadTree = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAddressService.getTree(province);
      setTree(res.success ? res.data : res);
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
      setTree(null);
    } finally {
      setLoading(false);
    }
  }, [province, showToast]);

  useEffect(() => { loadTree(); }, [loadTree]);

  useEffect(() => {
    adminCollectorService.getAll({ limit: 100 }).then((res) => {
      if (res.success) setCollectors(res.data?.collectors || []);
    });
  }, []);

  const districts = tree?.districts || [];

  const handleAdd = (node: any, level: number) => {
    const levels = ['province', 'district', 'sector', 'cell', 'village'];
    setEditNode(null);
    setParentContext({
      level: levels[Math.min(level + 1, 4)],
      province,
      district: level >= 0 ? node.name : undefined,
      sector: level >= 1 ? node.name : undefined,
    });
    setModalOpen(true);
  };

  const handleAssign = async () => {
    if (!assignNode?._id) return;
    try {
      const res = await adminAddressService.assignCollector(assignNode._id, selectedCollector || null);
      if (res.success !== false) {
        showToast({ type: 'success', title: 'Assigned', message: `✅ Collector assigned to ${assignNode.name}` });
        setAssignNode(null);
        loadTree();
      } else showToast({ type: 'error', title: 'Error', message: res.message });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d1f13]">Zones & Routes</h2>
          <p className="text-sm text-gray-500">Manage address zones and district collection schedules</p>
        </div>
      </div>

      <Tabs defaultValue="schedules" className="space-y-4">
        <TabsList className="rounded-xl">
          <TabsTrigger value="schedules">Collection Schedules</TabsTrigger>
          <TabsTrigger value="zones">Address Zones</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="mt-2">
          <AdminCollectionSchedules />
        </TabsContent>

        <TabsContent value="zones" className="mt-2 space-y-4">
          <div className="flex justify-end">
            <Button className="bg-green-600" onClick={() => { setEditNode(null); setParentContext({ level: 'district', province }); setModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Add Location
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {PROVINCES.map((p) => (
              <button key={p} type="button" onClick={() => setProvince(p)} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${province === p ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{p.replace(' Province', '')}</button>
            ))}
          </div>

          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-green-600" />{province} · {districts.length} districts</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : districts.length === 0 ? (
                <div className="py-16 text-center">
                  <MapPin className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p className="font-medium">No zones configured yet</p>
                  <Button variant="link" onClick={() => { setParentContext({ level: 'district', province }); setModalOpen(true); }}>Add Province →</Button>
                </div>
              ) : (
                districts.map((d: any, i: number) => (
                  <TreeNode key={d._id || d.name || i} node={d} onAdd={handleAdd} onEdit={(n: any) => { setEditNode(n); setModalOpen(true); }} onAssign={(n: any) => { setAssignNode(n); setSelectedCollector(''); }} />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddressNodeModal open={modalOpen} onClose={() => { setModalOpen(false); setEditNode(null); }} parentContext={parentContext} editNode={editNode} onSuccess={loadTree} />
      <Dialog open={Boolean(assignNode)} onOpenChange={() => setAssignNode(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Assign collector to {assignNode?.name}</DialogTitle>
            <DialogDescription>Select a collector for this zone</DialogDescription>
          </DialogHeader>
          <Select value={selectedCollector} onValueChange={setSelectedCollector}>
            <SelectTrigger><SelectValue placeholder="Select collector" /></SelectTrigger>
            <SelectContent>
              {collectors.map((c) => <SelectItem key={c._id || c.id} value={c._id || c.id}>{c.fullName}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setAssignNode(null)}>Cancel</Button>
            <Button className="flex-1 bg-green-600" onClick={handleAssign}>Assign</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
