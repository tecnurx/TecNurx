// src/app/layout.tsx  (or .jsx)
import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata = {
  title: 'TecNurx',
  description: 'Fast, reliable device repair and insurance',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}