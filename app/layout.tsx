import './globals.css';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/fraunces';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import { AppFrame } from '@/components/layout/AppFrame';

export const metadata: Metadata = {
  title: {
    default: 'SuitMe | Personal Try-On Studio',
    template: '%s | SuitMe',
  },
  description: 'A personal workspace for virtual try-on images and clothing listings.',
  verification: {
    google: 'cL6deASHGBDBw9-x50qoTqFsyCYiw0oH7xvBy4vAlsI',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-ZK655F8T1W" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-ZK655F8T1W');`}</Script>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
