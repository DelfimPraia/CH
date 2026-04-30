'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { checkInByCode, type CheckInResult } from './actions';

type BarcodeDetectorCtor = new (opts: { formats: string[] }) => {
  detect: (src: ImageBitmapSource) => Promise<{ rawValue: string }[]>;
};

declare global {
  interface Window { BarcodeDetector?: BarcodeDetectorCtor }
}

export default function Scanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanningRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const lastCodeRef = useRef<{ code: string; at: number }>({ code: '', at: 0 });

  const [scanning, setScanning] = useState(false);
  const [supportsCamera, setSupportsCamera] = useState(true);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.BarcodeDetector || !navigator.mediaDevices?.getUserMedia) {
      setSupportsCamera(false);
    }
  }, []);

  function stopScan() {
    scanningRef.current = false;
    setScanning(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  useEffect(() => () => stopScan(), []);

  async function submit(code: string) {
    setBusy(true);
    const r = await checkInByCode(code);
    setResult(r);
    setBusy(false);
  }

  async function startScan() {
    if (!window.BarcodeDetector) { setSupportsCamera(false); return; }
    setResult(null);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    } catch {
      setSupportsCamera(false);
      return;
    }
    streamRef.current = stream;

    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    await video.play();

    setScanning(true);
    scanningRef.current = true;
    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });

    const tick = async () => {
      if (!scanningRef.current || !videoRef.current) return;
      try {
        const codes = await detector.detect(videoRef.current);
        if (codes.length > 0) {
          const code = codes[0].rawValue;
          const now = Date.now();
          if (code !== lastCodeRef.current.code || now - lastCodeRef.current.at > 3000) {
            lastCodeRef.current = { code, at: now };
            await submit(code);
          }
        }
      } catch {
        // transient detect failures — keep scanning
      }
      if (scanningRef.current) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  async function onManualSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const code = String(fd.get('code') ?? '');
    if (!code) return;
    await submit(code);
    e.currentTarget.reset();
  }

  return (
    <div className="mt-6 space-y-4">
      {supportsCamera && (
        <div className="card overflow-hidden p-0">
          <div className="relative aspect-square w-full bg-black">
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
            {!scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button onClick={startScan} className="btn-primary">
                  <Camera className="h-4 w-4" /> Abrir câmara
                </button>
              </div>
            )}
            {scanning && (
              <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-white/70" />
            )}
          </div>
          {scanning && (
            <button onClick={stopScan} className="btn-secondary w-full rounded-none">Parar</button>
          )}
        </div>
      )}

      {!supportsCamera && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Este dispositivo não suporta deteção de QR no browser. Usa a entrada manual abaixo.
        </p>
      )}

      <form onSubmit={onManualSubmit} className="card flex gap-2">
        <input name="code" placeholder="ID do participante (UUID)" className="input flex-1" autoComplete="off" />
        <button type="submit" disabled={busy} className="btn-primary">Verificar</button>
      </form>

      {result && <ResultPanel result={result} onClear={() => setResult(null)} />}
    </div>
  );
}

function ResultPanel({ result, onClear }: { result: CheckInResult; onClear: () => void }) {
  if (!result.ok) {
    return (
      <div className="card flex items-start gap-3 border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20">
        <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
        <div className="flex-1">
          <p className="font-semibold text-red-900 dark:text-red-200">{result.error}</p>
        </div>
        <button onClick={onClear} aria-label="Limpar" className="rounded-full p-1 hover:bg-red-100 dark:hover:bg-red-900/40">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    );
  }
  return (
    <div className="card flex items-start gap-3 border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
      <div className="flex-1">
        <p className="font-semibold text-emerald-900 dark:text-emerald-200">
          {result.alreadyCheckedIn ? 'Já tinha feito check-in' : 'Check-in registado'}
        </p>
        <p className="mt-0.5 text-sm">{result.participant.full_name}</p>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {result.participant.company ?? result.participant.email}
        </p>
      </div>
      <button onClick={onClear} aria-label="Próximo" className="rounded-full p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40">
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}
