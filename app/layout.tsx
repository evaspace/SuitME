import './globals.css';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/fraunces';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppFrame } from '@/components/layout/AppFrame';

export const metadata: Metadata = {
  title: {
    default: 'Dress Me | Personal Try-On Studio',
    template: '%s | Dress Me',
  },
  description: 'A personal workspace for virtual try-on images and clothing listings.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
