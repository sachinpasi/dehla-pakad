import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "@/context/SocketContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevent zoom for app-like feel
  themeColor: '#051f11',
};

export const metadata: Metadata = {
  title: "Royal Tens | The Premium Card Game",
  description: "Experience the classic game of Royal Tens (Dehla Pakad) in a premium casino setting.",
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg', 
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Royal Tens',
  },
};

import { Toaster } from 'react-hot-toast';

import { VoiceProvider } from "@/context/VoiceContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SocketProvider>
          <VoiceProvider>
            {children}
          </VoiceProvider>
        </SocketProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
