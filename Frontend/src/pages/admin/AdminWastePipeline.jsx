import { useState, useEffect } from 'react';
import { adminWasteIntakeService, adminCatalogService } from '@/services/adminService';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Loader2, ArrowRight, Package, CheckCircle2, Inbox, Filter, ThermometerSun, Hammer, Box, Leaf } from 'lucide-react';
import { toast } from 'sonner';

const STAGES = ['received', 'sorting', 'curing', 'forming', 'packaging', 'product'];

export function AdminWastePipeline() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Convert Modal
  const [convertModal, setConvertModal] = useState({ open: false, item: null });
  const [convertData, setConvertData] = useState({ name: '', category: '', cashPrice: '', pointsCost: '', stock: '', description: '', imageUrl: '' });
  const [converting, setConverting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await adminWasteIntakeService.getAll({ limit: 100 });
      // API returns { records, pagination } — extract the records array
      const records = res?.data?.records || res?.records || res?.intakes || res?.items || [];
      setItems(Array.isArray(records) ? records : []);
    } catch (err) {
      toast.error('Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdvance = async (id, currentStage) => {
    const idx = STAGES.indexOf(currentStage);
    if (idx === -1 || idx >= STAGES.length - 1) return;
    const nextStage = STAGES[idx + 1];

    try {
      await adminWasteIntakeService.advanceStage(id, { stage: nextStage });
      toast.success(`Moved to ${nextStage}`);
      fetchItems();
    } catch (err) {
      toast.error(err.message || 'Failed to advance');
    }
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    if (!convertModal.item) return;
    setConverting(true);
    try {
      await adminWasteIntakeService.convertToProduct(convertModal.item._id || convertModal.item.id, {
        name: convertData.name,
        category: convertData.category,
        cashPrice: Number(convertData.cashPrice),
        pointsCost: Number(convertData.pointsCost),
        stock: Number(convertData.stock),
        description: convertData.description,
        imageUrl: convertData.imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80'
      });
      toast.success('Successfully converted to catalog product!');
      setConvertModal({ open: false, item: null });
      fetchItems();
    } catch (err) {
      toast.error(err.message || 'Failed to convert');
    } finally {
      setConverting(false);
    }
  };

  const getStageIcon = (stage) => {
    switch(stage) {
      case 'received': return <Inbox className="h-4 w-4 text-blue-600" />;
      case 'sorting': return <Filter className="h-4 w-4 text-purple-600" />;
      case 'curing': return <ThermometerSun className="h-4 w-4 text-amber-600" />;
      case 'forming': return <Hammer className="h-4 w-4 text-orange-600" />;
      case 'packaging': return <Box className="h-4 w-4 text-indigo-600" />;
      case 'product': return <Package className="h-4 w-4 text-emerald-600" />;
      default: return <Leaf className="h-4 w-4 text-gray-600" />;
    }
  };

  const getWasteColor = (type) => {
    switch(type?.toLowerCase()) {
      case 'organic': return 'border-l-lime-500 bg-lime-50 text-lime-700';
      case 'plastic': return 'border-l-blue-500 bg-blue-50 text-blue-700';
      case 'paper': return 'border-l-amber-500 bg-amber-50 text-amber-700';
      case 'glass': return 'border-l-cyan-500 bg-cyan-50 text-cyan-700';
      case 'metal': return 'border-l-gray-500 bg-gray-50 text-gray-700';
      default: return 'border-l-emerald-500 bg-emerald-50 text-emerald-700';
    }
  };

  const PipelineColumn = ({ stage, items }) => {
    const stageItems = Array.isArray(items) ? items.filter(i => i.processingStage === stage || i.processingStatus === stage) : [];
    const isLast = stage === 'product';

    return (
      <div className="flex-shrink-0 w-80 bg-gray-50/80 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[calc(100vh-14rem)]">
        <div className="p-4 border-b border-gray-200 bg-white rounded-t-2xl flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-100">
              {getStageIcon(stage)}
            </div>
            <h3 className="font-bold text-gray-900 capitalize">{stage}</h3>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-inner">{stageItems.length}</span>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
          {stageItems.map(item => {
            const wasteStyle = getWasteColor(item.wasteType);
            const badgeColor = wasteStyle.split(' ').slice(1).join(' ');
            const borderColor = wasteStyle.split(' ')[0];

            return (
              <div key={item._id || item.id} className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 border-l-4 ${borderColor} hover:shadow-md transition-all`}>
                <div className="flex justify-between items-start mb-3">
                  <Badge className={`${badgeColor} capitalize shadow-sm border-0 font-semibold`}>{item.wasteType}</Badge>
                  <span className="text-sm font-black text-gray-700">{item.weightKg} kg</span>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-2 mb-4 border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium line-clamp-2">
                    <span className="text-gray-400">Source:</span> {item.collectionRequest?.resident?.fullName || 'Unknown source'}
                  </p>
                </div>
                
                {!isLast ? (
                  <Button 
                    onClick={() => handleAdvance(item._id || item.id, stage)}
                    className="w-full h-9 text-xs font-bold bg-white text-gray-700 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    Move to Next Stage <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setConvertModal({ open: true, item, data: {} })}
                    className="w-full h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Package className="h-4 w-4" /> Convert to Product 
                  </Button>
                )}
              </div>
            );
          })}
          {stageItems.length === 0 && (
            <div className="text-center py-10 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <div className="h-10 w-10 bg-white rounded-full border border-gray-200 flex items-center justify-center mb-2 shadow-sm text-gray-300">
                {getStageIcon(stage)}
              </div>
              <p className="text-gray-400 text-sm font-medium">No items</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #9ca3af; }
        .horizontal-scrollbar::-webkit-scrollbar { height: 10px; }
        .horizontal-scrollbar::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 8px; }
        .horizontal-scrollbar::-webkit-scrollbar-thumb { background-color: #10b981; border-radius: 8px; border: 2px solid #f3f4f6; }
      `}</style>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Waste Pipeline</h1>
        <p className="text-gray-500">Track and process collected waste into eco-products</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-6 pt-2 flex-1 horizontal-scrollbar px-1">
          {STAGES.map(stage => <PipelineColumn key={stage} stage={stage} items={items} />)}
        </div>
      )}

      {/* Convert to Product Modal */}
      <Dialog open={convertModal.open} onOpenChange={o => !o && setConvertModal({ open: false, item: null })}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              Convert to Catalog Product
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleConvert} className="space-y-4 py-4">
            <div className="bg-emerald-50 rounded-lg p-3 text-sm text-emerald-800 mb-4 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              <p>You are converting <strong>{convertModal.item?.weightKg}kg</strong> of {convertModal.item?.wasteType} waste into a new product.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Name</label>
              <Input required value={convertData.name} onChange={e => setConvertData({...convertData, name: e.target.value})} placeholder="E.g. Recycled Paver Block" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input value={convertData.imageUrl} onChange={e => setConvertData({...convertData, imageUrl: e.target.value})} placeholder="Optional: https://..." />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select required value={convertData.category} onChange={e => setConvertData({...convertData, category: e.target.value})} className="w-full h-10 rounded-md border border-input px-3">
                  <option value="">Select...</option>
                  <option value="compost">Compost</option>
                  <option value="pavers">Pavers</option>
                  <option value="recycled_goods">Recycled Goods</option>
                  <option value="upcycled">Upcycled</option>
                  <option value="eco_product">Eco Product</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Stock</label>
                <Input required type="number" min="1" value={convertData.stock} onChange={e => setConvertData({...convertData, stock: e.target.value})} placeholder="0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cash Price (RWF)</label>
                <Input required type="number" min="0" value={convertData.cashPrice} onChange={e => setConvertData({...convertData, cashPrice: e.target.value})} placeholder="0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Points Cost</label>
                <Input required type="number" min="0" value={convertData.pointsCost} onChange={e => setConvertData({...convertData, pointsCost: e.target.value})} placeholder="0" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={convertData.description} onChange={e => setConvertData({...convertData, description: e.target.value})} placeholder="Product details..." />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setConvertModal({ open: false, item: null })}>Cancel</Button>
              <Button type="submit" disabled={converting} className="bg-emerald-600 hover:bg-emerald-700">
                {converting ? 'Converting...' : 'Create Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
