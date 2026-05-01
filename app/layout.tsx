import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Oil & Gas Conference',
  description: 'Plataforma oficial do evento — agenda, palestrantes, networking e check-in.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'AI O&G' },
  other: { 'mobile-web-app-capable': 'yes' },
};

export const viewport: Viewport = {
  themeColor: '#1c70f5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className="dark">
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
