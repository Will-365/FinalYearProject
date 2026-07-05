import { useState, useEffect, useCallback } from 'react';
import { adminWasteIntakeService } from '@/services/adminService';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Loader2, ArrowRight, Package, CheckCircle2, Inbox, ThermometerSun,
  Box, Leaf, Plus, FlaskConical, Wind, Layers, Recycle, Scale,
  ChevronRight, Clock, Hash, AlertCircle, Flame, Blend, Sparkles,
  Scissors, Combine, Hammer, Zap, LayoutGrid,
} from 'lucide-react';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
//  PIPELINE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────
const ORGANIC_STAGES    = ['receiving','turning','curing','sieving','packaging','products'];
const PLASTIC_STAGES    = ['receiving','shredding','melting','mixing','molding','finishing','products'];
const MIXED_STAGES      = ['receiving','sorting','processing','blending','forming','finishing','products'];

const ALL_STAGE_META = {
  // shared
  receiving:   { label:'Receiving',   color:'blue',    bg:'bg-blue-50',   border:'border-blue-200',   text:'text-blue-700',   badge:'bg-blue-100 text-blue-800',    icon: Inbox },
  products:    { label:'Products',    color:'emerald', bg:'bg-emerald-50',border:'border-emerald-200',text:'text-emerald-700',badge:'bg-emerald-100 text-emerald-800',icon: Package },
  packaging:   { label:'Packaging',   color:'indigo',  bg:'bg-indigo-50', border:'border-indigo-200', text:'text-indigo-700', badge:'bg-indigo-100 text-indigo-800', icon: Box },
  // organic
  turning:     { label:'Turning',     color:'lime',    bg:'bg-lime-50',   border:'border-lime-200',   text:'text-lime-700',   badge:'bg-lime-100 text-lime-800',    icon: Wind },
  curing:      { label:'Curing',      color:'amber',   bg:'bg-amber-50',  border:'border-amber-200',  text:'text-amber-700',  badge:'bg-amber-100 text-amber-800',  icon: ThermometerSun },
  sieving:     { label:'Sieving',     color:'orange',  bg:'bg-orange-50', border:'border-orange-200', text:'text-orange-700', badge:'bg-orange-100 text-orange-800', icon: FlaskConical },
  // plastic
  shredding:   { label:'Shredding',   color:'red',     bg:'bg-red-50',    border:'border-red-200',    text:'text-red-700',    badge:'bg-red-100 text-red-800',      icon: Scissors },
  melting:     { label:'Melting',     color:'orange',  bg:'bg-orange-50', border:'border-orange-200', text:'text-orange-700', badge:'bg-orange-100 text-orange-800', icon: Flame },
  mixing:      { label:'Mixing',      color:'purple',  bg:'bg-purple-50', border:'border-purple-200', text:'text-purple-700', badge:'bg-purple-100 text-purple-800', icon: Blend },
  molding:     { label:'Molding',     color:'indigo',  bg:'bg-indigo-50', border:'border-indigo-200', text:'text-indigo-700', badge:'bg-indigo-100 text-indigo-800', icon: Hammer },
  finishing:   { label:'Finishing',   color:'teal',    bg:'bg-teal-50',   border:'border-teal-200',   text:'text-teal-700',   badge:'bg-teal-100 text-teal-800',    icon: Sparkles },
  // mixed
  sorting:     { label:'Sorting',     color:'violet',  bg:'bg-violet-50', border:'border-violet-200', text:'text-violet-700', badge:'bg-violet-100 text-violet-800', icon: LayoutGrid },
  processing:  { label:'Processing',  color:'amber',   bg:'bg-amber-50',  border:'border-amber-200',  text:'text-amber-700',  badge:'bg-amber-100 text-amber-800',  icon: Zap },
  blending:    { label:'Blending',    color:'purple',  bg:'bg-purple-50', border:'border-purple-200', text:'text-purple-700', badge:'bg-purple-100 text-purple-800', icon: Combine },
  forming:     { label:'Forming',     color:'sky',     bg:'bg-sky-50',    border:'border-sky-200',    text:'text-sky-700',    badge:'bg-sky-100 text-sky-800',      icon: Hammer },
};

const PIPELINE_CONFIG = {
  organic:    { stages: ORGANIC_STAGES,  label: 'Organic',    emoji: '🌿', accent: 'green',  stockKey: 'organic' },
  plastic:    { stages: PLASTIC_STAGES,  label: 'Plastics',   emoji: '♻️', accent: 'blue',   stockKey: 'recyclable' },
  mixed:      { stages: MIXED_STAGES,    label: 'Mixed',      emoji: '🔀', accent: 'purple', stockKey: null },
};

const CATEGORY_PREFIXES = { organic: 'ORG', plastic: 'PLS', mixed: 'MIX' };

// ─────────────────────────────────────────────────────────────────────────────
//  LOCALSTORAGE
// ─────────────────────────────────────────────────────────────────────────────
const LS_KEY = 'gc_pipeline_batches_v2';

const loadBatches = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
};
const saveBatches = (b) => localStorage.setItem(LS_KEY, JSON.stringify(b));

const nextId = (batches, category) => {
  const prefix = CATEGORY_PREFIXES[category] || 'BAT';
  const count = batches.filter(b => b.category === category).length;
  return `${prefix}-${String(count + 1).padStart(3, '0')}`;
};

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const BORDER_COLORS = {
  blue:'#3b82f6', lime:'#84cc16', amber:'#f59e0b', orange:'#f97316',
  indigo:'#6366f1', emerald:'#10b981', red:'#ef4444', purple:'#a855f7',
  teal:'#14b8a6', violet:'#8b5cf6', sky:'#0ea5e9', green:'#22c55e',
};
const getBorderColor = (color) => BORDER_COLORS[color] || '#10b981';

const CONVERT_DEFAULT = { name:'', category:'', cashPrice:'', pointsCost:'', stock:'', description:'', imageUrl:'' };

// ─────────────────────────────────────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function AdminWastePipeline() {
  const [batches, setBatches]           = useState(loadBatches);
  const [stockpile, setStockpile]       = useState({ organic: 0, recyclable: 0 });
  const [loadingStock, setLoadingStock] = useState(true);
  const [activeTab, setActiveTab]       = useState('organic'); // 'organic' | 'plastic' | 'mixed'

  // Start-batch modal
  const [startModal, setStartModal]     = useState(false);
  const [batchForm, setBatchForm]       = useState({
    category: 'organic',
    weightKg: '',
    // mixed only
    organicKg: '',
    recyclableKg: '',
  });
  const [startingBatch, setStartingBatch] = useState(false);

  // Convert modal
  const [convertModal, setConvertModal] = useState({ open: false, batch: null });
  const [convertData, setConvertData]   = useState(CONVERT_DEFAULT);
  const [converting, setConverting]     = useState(false);

  // ── Stockpile ─────────────────────────────────────────────────────────────
  const fetchStockpile = useCallback(async () => {
    setLoadingStock(true);
    try {
      const res = await adminWasteIntakeService.getAnalytics({ period: '90d' });
      const byCategory = res?.data?.byCategory || res?.byCategory || [];
      const orgEntry = byCategory.find(c => c._id?.toLowerCase() === 'organic');
      const recEntry = byCategory.find(c =>
        ['recyclable','plastic','inorganic'].includes(c._id?.toLowerCase())
      );
      setStockpile({ organic: orgEntry?.totalWeightKg || 0, recyclable: recEntry?.totalWeightKg || 0 });
    } catch {
      setStockpile({ organic: 0, recyclable: 0 });
    } finally {
      setLoadingStock(false);
    }
  }, []);

  useEffect(() => { fetchStockpile(); }, [fetchStockpile]);

  // ── Derived stock ─────────────────────────────────────────────────────────
  const committedKg = (stockKey) =>
    batches
      .filter(b => PIPELINE_CONFIG[b.category]?.stockKey === stockKey && b.stage !== 'products')
      .reduce((s, b) => {
        if (b.category === 'mixed') return s + (b.organicKg || 0) + (b.recyclableKg || 0);
        return s + (b.weightKg || 0);
      }, 0);

  const availableKg = (stockKey) => Math.max(0, stockpile[stockKey === 'organic' ? 'organic' : 'recyclable'] - committedKg(stockKey));

  // ── Start batch ───────────────────────────────────────────────────────────
  const handleStartBatch = () => {
    const cat = batchForm.category;

    if (cat === 'mixed') {
      const oKg = parseFloat(batchForm.organicKg) || 0;
      const rKg = parseFloat(batchForm.recyclableKg) || 0;
      if (oKg <= 0 && rKg <= 0) { toast.error('Enter at least one kg amount'); return; }
      if (oKg > availableKg('organic')) { toast.error(`Only ${availableKg('organic').toFixed(1)} kg organic available`); return; }
      if (rKg > availableKg('recyclable')) { toast.error(`Only ${availableKg('recyclable').toFixed(1)} kg recyclable available`); return; }

      setStartingBatch(true);
      try {
        const id = nextId(batches, 'mixed');
        const nb = {
          id, category: 'mixed',
          organicKg: oKg, recyclableKg: rKg,
          weightKg: oKg + rKg,
          stage: 'receiving',
          createdAt: new Date().toISOString(),
          history: [{ stage: 'receiving', timestamp: new Date().toISOString() }],
          convertedToProduct: false,
        };
        const updated = [...batches, nb];
        setBatches(updated); saveBatches(updated);
        toast.success(`Mixed Batch ${id} started — ${oKg}kg organic + ${rKg}kg recyclable`);
        setStartModal(false);
        setBatchForm({ category: 'organic', weightKg: '', organicKg: '', recyclableKg: '' });
      } finally { setStartingBatch(false); }
      return;
    }

    const kg = parseFloat(batchForm.weightKg);
    if (!kg || kg <= 0) { toast.error('Enter a valid kg amount'); return; }
    const stockKey = PIPELINE_CONFIG[cat]?.stockKey;
    if (stockKey && kg > availableKg(stockKey)) {
      toast.error(`Only ${availableKg(stockKey).toFixed(1)} kg available`); return;
    }

    setStartingBatch(true);
    try {
      const id = nextId(batches, cat);
      const nb = {
        id, category: cat, weightKg: kg,
        stage: 'receiving',
        createdAt: new Date().toISOString(),
        history: [{ stage: 'receiving', timestamp: new Date().toISOString() }],
        convertedToProduct: false,
      };
      const updated = [...batches, nb];
      setBatches(updated); saveBatches(updated);
      toast.success(`Batch ${id} started — ${kg} kg of ${cat}`);
      setStartModal(false);
      setBatchForm({ category: 'organic', weightKg: '', organicKg: '', recyclableKg: '' });
    } finally { setStartingBatch(false); }
  };

  // ── Advance stage ─────────────────────────────────────────────────────────
  const handleAdvance = (batchId) => {
    const updated = batches.map(b => {
      if (b.id !== batchId) return b;
      const stages = PIPELINE_CONFIG[b.category]?.stages || ORGANIC_STAGES;
      const idx = stages.indexOf(b.stage);
      if (idx < 0 || idx >= stages.length - 1) return b;
      const next = stages[idx + 1];
      return { ...b, stage: next, history: [...b.history, { stage: next, timestamp: new Date().toISOString() }] };
    });
    setBatches(updated); saveBatches(updated);
    const b = updated.find(x => x.id === batchId);
    toast.success(`${batchId} → ${ALL_STAGE_META[b.stage]?.label || b.stage}`);
  };

  // ── Convert ───────────────────────────────────────────────────────────────
  const handleConvert = async (e) => {
    e.preventDefault();
    if (!convertModal.batch) return;
    setConverting(true);
    try {
      const intakeRes = await adminWasteIntakeService.create({
        wasteType: convertModal.batch.category === 'mixed' ? 'mixed' : (convertModal.batch.category === 'plastic' ? 'recyclable' : convertModal.batch.category),
        weightKg: convertModal.batch.weightKg,
        location: { province: 'Kigali City', district: 'Gasabo' },
        intakeDate: convertModal.batch.createdAt?.slice(0, 10),
        notes: `Batch ${convertModal.batch.id} — processed through pipeline`,
      });
      const intakeId = intakeRes?.data?._id || intakeRes?._id || intakeRes?.data?.id;
      if (intakeId) {
        // The backend requires the intake to be at the 'packaging' stage before conversion
        await adminWasteIntakeService.advanceStage(intakeId, { stage: 'packaging' });

        await adminWasteIntakeService.convertToProduct(intakeId, {
          name: convertData.name, category: convertData.category,
          cashPrice: Number(convertData.cashPrice), pointsCost: Number(convertData.pointsCost),
          stock: Number(convertData.stock), description: convertData.description,
          imageUrl: convertData.imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
        });
      }
      const updated = batches.map(b =>
        b.id === convertModal.batch.id ? { ...b, convertedToProduct: true, productName: convertData.name } : b
      );
      setBatches(updated); saveBatches(updated);
      toast.success(`Batch ${convertModal.batch.id} converted to product!`);
      setConvertModal({ open: false, batch: null });
      setConvertData(CONVERT_DEFAULT);
    } catch (err) {
      toast.error(err?.message || 'Failed to convert');
    } finally { setConverting(false); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  SUB-COMPONENTS
  // ─────────────────────────────────────────────────────────────────────────

  const BatchCard = ({ batch }) => {
    const cfg   = PIPELINE_CONFIG[batch.category] || PIPELINE_CONFIG.organic;
    const stages = cfg.stages;
    const isLast = batch.stage === 'products';
    const meta   = ALL_STAGE_META[batch.stage] || ALL_STAGE_META.receiving;
    const daysAgo = Math.floor((Date.now() - new Date(batch.createdAt)) / 86400000);
    const progress = ((stages.indexOf(batch.stage) + 1) / stages.length) * 100;

    const categoryBadgeStyle =
      batch.category === 'organic'  ? 'bg-green-100 text-green-700' :
      batch.category === 'plastic'  ? 'bg-blue-100 text-blue-700' :
                                      'bg-purple-100 text-purple-700';
    const categoryLabel =
      batch.category === 'organic'  ? '🌿 Organic' :
      batch.category === 'plastic'  ? '♻️ Plastics' : '🔀 Mixed';

    return (
      <div
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all"
        style={{ borderLeft: `4px solid ${getBorderColor(meta.color)}` }}
      >
        {/* Top row */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-wrap gap-1.5">
            <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${meta.badge}`}>
              #{batch.id}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${categoryBadgeStyle}`}>
              {categoryLabel}
            </span>
          </div>
          {batch.convertedToProduct && (
            <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-lg">✅ Done</span>
          )}
        </div>

        {/* Weight */}
        {batch.category === 'mixed' ? (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Scale className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xl font-black text-gray-800">{batch.weightKg}<span className="text-xs font-medium text-gray-400 ml-1">kg total</span></span>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-semibold">🌿 {batch.organicKg}kg</span>
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold">♻️ {batch.recyclableKg}kg</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-3">
            <Scale className="h-4 w-4 text-gray-400" />
            <span className="text-2xl font-black text-gray-800">
              {batch.weightKg}<span className="text-sm font-medium text-gray-400 ml-1">kg</span>
            </span>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{batch.history.length}/{stages.length} stages</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{daysAgo === 0 ? 'Today' : `${daysAgo}d`}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: getBorderColor(meta.color) }}
            />
          </div>
        </div>

        {/* Action */}
        {!batch.convertedToProduct && (
          !isLast ? (
            <Button
              onClick={() => handleAdvance(batch.id)}
              className="w-full h-9 text-xs font-bold bg-white text-gray-700 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 flex items-center justify-center gap-2 shadow-sm"
            >
              Next Stage <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              onClick={() => { setConvertModal({ open: true, batch }); setConvertData(CONVERT_DEFAULT); }}
              className="w-full h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow"
            >
              <Package className="h-3.5 w-3.5" /> Convert to Product
            </Button>
          )
        )}
      </div>
    );
  };

  const PipelineColumn = ({ stage, pipelineCategory }) => {
    const meta   = ALL_STAGE_META[stage] || ALL_STAGE_META.receiving;
    const Icon   = meta.icon;
    const cards  = batches.filter(b => b.category === pipelineCategory && b.stage === stage);
    const totalKg = cards.reduce((s, b) => s + (b.weightKg || 0), 0);

    return (
      <div className="flex-shrink-0 w-[272px] bg-gray-50/80 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[calc(100vh-22rem)]">
        <div className="p-4 border-b border-gray-100 bg-white rounded-t-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 ${meta.bg} rounded-lg border ${meta.border}`}>
              <Icon className={`h-4 w-4 ${meta.text}`} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm leading-none">{meta.label}</h3>
              {totalKg > 0 && <p className="text-[10px] text-gray-400 mt-0.5">{totalKg.toFixed(1)} kg</p>}
            </div>
          </div>
          <span className={`${meta.badge} text-xs font-bold px-2.5 py-1 rounded-full`}>{cards.length}</span>
        </div>

        <div className="p-3 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
          {cards.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 py-8">
              <div className={`h-10 w-10 ${meta.bg} rounded-full border ${meta.border} flex items-center justify-center mb-2`}>
                <Icon className={`h-5 w-5 ${meta.text}`} />
              </div>
              <p className="text-gray-400 text-xs font-medium">No batches</p>
            </div>
          ) : cards.map(b => <BatchCard key={b.id} batch={b} />)}
        </div>
      </div>
    );
  };

  // ─── Stats ────────────────────────────────────────────────────────────────
  const totalActive     = batches.filter(b => !b.convertedToProduct).length;
  const totalConverted  = batches.filter(b => b.convertedToProduct).length;
  const totalInProgress = batches.filter(b => !b.convertedToProduct).reduce((s,b) => s + b.weightKg, 0);
  const currentCfg      = PIPELINE_CONFIG[activeTab];

  // Mixed tab: available org kg for mixed
  const mixedOrgKg  = parseFloat(batchForm.organicKg) || 0;
  const mixedRecKg  = parseFloat(batchForm.recyclableKg) || 0;
  const mixedTotal  = mixedOrgKg + mixedRecKg;

  return (
    <div className="space-y-4 h-full flex flex-col">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 20px; }
        .horizontal-scrollbar::-webkit-scrollbar { height: 8px; }
        .horizontal-scrollbar::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 8px; }
        .horizontal-scrollbar::-webkit-scrollbar-thumb { background-color: #10b981; border-radius: 8px; border: 2px solid #f3f4f6; }
      `}</style>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Waste Pipeline</h1>
          <p className="text-sm text-gray-500">Track waste from reception to finished products</p>
        </div>
        <Button
          onClick={() => setStartModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100 font-semibold px-5"
        >
          <Plus className="h-4 w-4 mr-2" /> Start Batch
        </Button>
      </div>

      {/* ── Stockpile cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key:'organic',    label:'Organic Stock',    icon: Leaf,         accentBg:'bg-green-50',   accentBorder:'border-green-100',  accentText:'text-green-600',  sub: `${availableKg('organic').toFixed(1)} kg available` },
          { key:'recyclable', label:'Plastic Stock',    icon: Recycle,      accentBg:'bg-blue-50',    accentBorder:'border-blue-100',   accentText:'text-blue-600',   sub: `${availableKg('recyclable').toFixed(1)} kg available` },
          { key:'active',     label:'Active Batches',   icon: Layers,       accentBg:'bg-amber-50',   accentBorder:'border-amber-100',  accentText:'text-amber-600',  sub: `${totalInProgress.toFixed(1)} kg in progress` },
          { key:'converted',  label:'Converted',        icon: CheckCircle2, accentBg:'bg-emerald-50', accentBorder:'border-emerald-100',accentText:'text-emerald-600',sub: 'Total products created' },
        ].map(({ key, label, icon: Icon, accentBg, accentBorder, accentText, sub }) => {
          const val =
            key === 'organic'    ? stockpile.organic.toFixed(1) + ' kg' :
            key === 'recyclable' ? stockpile.recyclable.toFixed(1) + ' kg' :
            key === 'active'     ? totalActive :
                                   totalConverted;
          return (
            <div key={key} className={`bg-white rounded-2xl border ${accentBorder} p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-24 h-24 ${accentBg} rounded-bl-full pointer-events-none opacity-50`} />
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 ${accentBg} rounded-xl`}><Icon className={`h-4 w-4 ${accentText}`} /></div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</span>
              </div>
              {loadingStock && key !== 'active' && key !== 'converted' ? (
                <div className="h-8 w-24 bg-gray-100 animate-pulse rounded-lg mt-1" />
              ) : (
                <>
                  <p className="text-3xl font-black text-gray-900">{val}</p>
                  <p className={`text-xs font-semibold mt-1 ${accentText}`}>{sub}</p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Pipeline Tabs ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1 w-fit">
        {Object.entries(PIPELINE_CONFIG).map(([cat, cfg]) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === cat
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{cfg.emoji}</span>
            {cfg.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
              activeTab === cat ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
            }`}>
              {batches.filter(b => b.category === cat && !b.convertedToProduct).length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Stage progress legend ────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-2xl px-5 py-3 shadow-sm overflow-x-auto">
        <span className="text-xs font-semibold text-gray-400 mr-2 shrink-0">
          {currentCfg.emoji} {currentCfg.label}:
        </span>
        {currentCfg.stages.map((stage, i) => {
          const meta = ALL_STAGE_META[stage];
          const Icon = meta.icon;
          return (
            <div key={stage} className="flex items-center gap-1.5 shrink-0">
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${meta.badge} text-xs font-semibold`}>
                <Icon className="h-3 w-3" /> {meta.label}
              </div>
              {i < currentCfg.stages.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
            </div>
          );
        })}
      </div>

      {/* ── Kanban board ─────────────────────────────────────────────────── */}
      {loadingStock ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 flex-1 horizontal-scrollbar px-1">
          {currentCfg.stages.map(stage => (
            <PipelineColumn key={stage} stage={stage} pipelineCategory={activeTab} />
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          START BATCH MODAL
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={startModal} onOpenChange={o => { if (!o) { setStartModal(false); setBatchForm({ category: 'organic', weightKg: '', organicKg: '', recyclableKg: '' }); }}}>
        <DialogContent className="max-w-lg bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <Plus className="h-5 w-5 text-emerald-600" />
              </div>
              Start Processing Batch
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Category pills */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-3">Batch Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value:'organic',    label:'🌿 Organic',  desc:`${availableKg('organic').toFixed(1)} kg available`,    color:'green' },
                  { value:'plastic',    label:'♻️ Plastics', desc:`${availableKg('recyclable').toFixed(1)} kg available`,  color:'blue' },
                  { value:'mixed',      label:'🔀 Mixed',    desc:'Combine organic + recyclable',                          color:'purple' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setBatchForm(f => ({ ...f, category: opt.value, weightKg: '', organicKg: '', recyclableKg: '' }))}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                      batchForm.category === opt.value
                        ? `border-${opt.color}-500 bg-${opt.color}-50`
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    style={batchForm.category === opt.value ? { borderColor: BORDER_COLORS[opt.color === 'green' ? 'emerald' : opt.color] } : {}}
                  >
                    <div className="font-bold text-sm text-gray-900">{opt.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Single type inputs ───────────────────────────────────── */}
            {batchForm.category !== 'mixed' && (
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Quantity to Process (kg)
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    Max {availableKg(batchForm.category === 'plastic' ? 'recyclable' : 'organic').toFixed(1)} kg
                  </span>
                </label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number" step="0.1" min="0.1"
                    value={batchForm.weightKg}
                    onChange={e => setBatchForm(f => ({ ...f, weightKg: e.target.value }))}
                    placeholder="Enter kg..."
                    className="pl-9 h-11 rounded-xl font-semibold"
                  />
                </div>
                {batchForm.weightKg && parseFloat(batchForm.weightKg) > availableKg(batchForm.category === 'plastic' ? 'recyclable' : 'organic') && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Exceeds available stock
                  </p>
                )}
              </div>
            )}

            {/* ── Mixed type inputs ────────────────────────────────────── */}
            {batchForm.category === 'mixed' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-green-700 block mb-1.5">
                      🌿 Organic (kg)
                      <span className="ml-1 font-normal text-gray-400">max {availableKg('organic').toFixed(1)}</span>
                    </label>
                    <div className="relative">
                      <Leaf className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-green-400" />
                      <Input
                        type="number" step="0.1" min="0"
                        value={batchForm.organicKg}
                        onChange={e => setBatchForm(f => ({ ...f, organicKg: e.target.value }))}
                        placeholder="0"
                        className="pl-8 h-10 rounded-xl text-sm"
                      />
                    </div>
                    {mixedOrgKg > availableKg('organic') && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Exceeds stock</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-blue-700 block mb-1.5">
                      ♻️ Recyclable (kg)
                      <span className="ml-1 font-normal text-gray-400">max {availableKg('recyclable').toFixed(1)}</span>
                    </label>
                    <div className="relative">
                      <Recycle className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-400" />
                      <Input
                        type="number" step="0.1" min="0"
                        value={batchForm.recyclableKg}
                        onChange={e => setBatchForm(f => ({ ...f, recyclableKg: e.target.value }))}
                        placeholder="0"
                        className="pl-8 h-10 rounded-xl text-sm"
                      />
                    </div>
                    {mixedRecKg > availableKg('recyclable') && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Exceeds stock</p>
                    )}
                  </div>
                </div>

                {mixedTotal > 0 && (
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex gap-3 text-xs">
                      <span className="text-green-700 font-semibold">🌿 {mixedOrgKg} kg</span>
                      <span className="text-gray-400">+</span>
                      <span className="text-blue-700 font-semibold">♻️ {mixedRecKg} kg</span>
                    </div>
                    <span className="text-purple-700 font-black text-sm">{mixedTotal.toFixed(1)} kg total</span>
                  </div>
                )}
              </div>
            )}

            {/* Batch preview */}
            {(() => {
              const isValid =
                batchForm.category === 'mixed'
                  ? (mixedOrgKg > 0 || mixedRecKg > 0) &&
                    mixedOrgKg <= availableKg('organic') &&
                    mixedRecKg <= availableKg('recyclable')
                  : parseFloat(batchForm.weightKg) > 0 &&
                    parseFloat(batchForm.weightKg) <= availableKg(batchForm.category === 'plastic' ? 'recyclable' : 'organic');

              if (!isValid) return null;
              return (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">Batch Preview</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-emerald-800">{nextId(batches, batchForm.category)}</span>
                      <span className="text-xs text-emerald-600 ml-2">→ Entering Receiving</span>
                    </div>
                    <span className="text-lg font-black text-emerald-700">
                      {batchForm.category === 'mixed' ? `${mixedTotal.toFixed(1)} kg` : `${batchForm.weightKg} kg`}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">
                    Stages: {PIPELINE_CONFIG[batchForm.category].stages.join(' → ')}
                  </p>
                </div>
              );
            })()}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setStartModal(false); setBatchForm({ category:'organic', weightKg:'', organicKg:'', recyclableKg:'' }); }}>
              Cancel
            </Button>
            <Button
              onClick={handleStartBatch}
              disabled={startingBatch}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6"
            >
              {startingBatch
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Starting...</>
                : 'Start Batch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
          CONVERT TO PRODUCT MODAL
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={convertModal.open} onOpenChange={o => !o && setConvertModal({ open: false, batch: null })}>
        <DialogContent className="max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 rounded-xl"><Package className="h-5 w-5 text-emerald-600" /></div>
              Convert Batch to Product
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleConvert} className="space-y-4 py-2">
            {/* Batch banner */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Batch</p>
                <p className="text-base font-black text-emerald-800">{convertModal.batch?.id}</p>
                <p className="text-xs text-emerald-600 capitalize">{convertModal.batch?.category}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-emerald-600">Total Weight</p>
                <p className="text-xl font-black text-emerald-800">{convertModal.batch?.weightKg} kg</p>
                {convertModal.batch?.category === 'mixed' && (
                  <p className="text-xs text-emerald-600">
                    🌿{convertModal.batch.organicKg}kg + ♻️{convertModal.batch.recyclableKg}kg
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Product Name *</label>
              <Input required value={convertData.name} onChange={e => setConvertData({ ...convertData, name: e.target.value })} placeholder="E.g. Organic Compost Fertiliser" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input value={convertData.imageUrl} onChange={e => setConvertData({ ...convertData, imageUrl: e.target.value })} placeholder="Optional: https://..." className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <select required value={convertData.category} onChange={e => setConvertData({ ...convertData, category: e.target.value })} className="w-full h-10 rounded-xl border border-input px-3 text-sm bg-white">
                  <option value="">Select...</option>
                  <option value="compost">Compost</option>
                  <option value="fertiliser">Fertiliser</option>
                  <option value="pavers">Pavers</option>
                  <option value="recycled_goods">Recycled Goods</option>
                  <option value="plastic_product">Plastic Product</option>
                  <option value="eco_product">Eco Product</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Stock</label>
                <Input required type="number" min="1" value={convertData.stock} onChange={e => setConvertData({ ...convertData, stock: e.target.value })} placeholder="Units" className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cash Price (RWF)</label>
                <Input required type="number" min="0" value={convertData.cashPrice} onChange={e => setConvertData({ ...convertData, cashPrice: e.target.value })} placeholder="0" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Points Cost</label>
                <Input required type="number" min="0" value={convertData.pointsCost} onChange={e => setConvertData({ ...convertData, pointsCost: e.target.value })} placeholder="0" className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={convertData.description} onChange={e => setConvertData({ ...convertData, description: e.target.value })} placeholder="Product details..." className="rounded-xl resize-none" rows={2} />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setConvertModal({ open: false, batch: null })}>Cancel</Button>
              <Button type="submit" disabled={converting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6">
                {converting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Converting...</> : 'Create Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
