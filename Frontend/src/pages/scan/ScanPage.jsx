import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppToast } from '@/hooks/useAppToast';
import { wasteService } from '@/services/wasteService';
import { fileToBase64 } from '@/utils/formatters';
import { ScanUploader, ScanLoader } from '@/components/waste/ScanUploader';
import { ScanResult } from '@/components/waste/ScanResult';
import { ScanHistoryCard } from '@/components/waste/ScanHistoryCard';
import { LoadingButton } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

export function ScanPage({ onNavigate }) {
  const { user, setCollectionPrefill } = useAuth();
  const { success, error } = useAppToast();
  const [tab, setTab] = useState('scan');
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [fieldError, setFieldError] = useState('');
  const [history, setHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPages, setHistoryPages] = useState(1);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadHistory = async (page = 1) => {
    setLoadingHistory(true);
    try {
      const data = await wasteService.getHistory(page, 10);
      setHistory(data.scans || data.items || data || []);
      setHistoryPages(data.pagination?.totalPages || data.totalPages || 1);
      setHistoryPage(page);
    } catch (err) {
      error(err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (tab === 'history') loadHistory(1);
  }, [tab]);

  const handleScan = async () => {
    if (!preview?.file) {
      setFieldError('Please capture or upload an image first');
      return;
    }
    setFieldError('');
    setScanning(true);
    setResult(null);
    try {
      const base64 = await fileToBase64(preview.file);
      const data = await wasteService.scan(base64, preview.mimeType);
      setResult(data);
      success('Waste scanned! Request a collection to earn points. 🌿');
    } catch (err) {
      error(err.message || 'Scan failed. Please try a clearer image.');
    } finally {
      setScanning(false);
    }
  };

  const handleRequestCollection = (scanData) => {
    setCollectionPrefill({
      wasteScanId: scanData.scanId || scanData._id,
      wasteType: scanData.wasteType,
    });
    onNavigate?.('collection-request');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Waste Scanner</h1>
        <p className="text-slate-500">Snap a photo and get instant sorting guidance</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2 rounded-xl">
          <TabsTrigger value="scan">New Scan</TabsTrigger>
          <TabsTrigger value="history">Scan History</TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="mt-6 space-y-6">
          <ScanUploader
            preview={preview}
            onPreviewChange={(p) => {
              setPreview(p);
              setResult(null);
              setFieldError('');
            }}
            onError={(msg) => {
              setFieldError(msg);
              error(msg);
            }}
          />
          {fieldError && (
            <p className="text-sm text-red-600">{fieldError}</p>
          )}

          {scanning ? (
            <ScanLoader />
          ) : (
            <>
              {preview && !result && (
                <LoadingButton
                  loading={scanning}
                  onClick={handleScan}
                  className="w-full py-3"
                >
                  Analyze Waste
                </LoadingButton>
              )}
              {result && (
                <ScanResult
                  result={result}
                  onRequestCollection={handleRequestCollection}
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {loadingHistory ? (
            <CardSkeleton count={4} />
          ) : history.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <span className="text-4xl">📷</span>
              <p className="mt-3 font-semibold text-slate-900">No scans yet</p>
              <p className="text-sm text-slate-500">Your scan history will appear here after your first analysis</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {history.map((scan) => (
                  <ScanHistoryCard key={scan._id || scan.scanId} scan={scan} />
                ))}
              </div>
              <Pagination
                page={historyPage}
                totalPages={historyPages}
                onPageChange={loadHistory}
                loading={loadingHistory}
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
