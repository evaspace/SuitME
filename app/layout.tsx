import './globals.css';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/fraunces';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
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
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
