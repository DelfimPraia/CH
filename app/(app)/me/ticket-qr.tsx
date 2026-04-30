'use client';

import { QRCodeSVG } from 'qrcode.react';

export default function TicketQR({ userId }: { userId: string }) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <QRCodeSVG value={`aiog:${userId}`} size={220} level="M" includeMargin={false} />
    </div>
  );
}
