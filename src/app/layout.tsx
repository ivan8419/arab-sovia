import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Geist } from 'next/font/google'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/providers'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Duolingo Sov - Belajar Kata Kerja Arab',
  description:
    "Aplikasi pembelajaran konjugasi kata kerja bahasa Arab (Fi'il) dengan dhomir",
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={cn('font-sans', geist.variable)}>
      <head>
        <meta name="theme-color" content="#58CC02" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              const savedTheme = window.localStorage.getItem('arabsovia-theme');
              if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
              }
            } catch (error) {}
          `}
        </Script>
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV !== 'production' ? (
          <Script id="service-worker-cleanup" strategy="beforeInteractive">
            {`
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  return Promise.all(registrations.map(function(registration) {
                    return registration.unregister();
                  }));
                }).catch(function() {});
              }

              if ('caches' in window) {
                caches.keys().then(function(cacheKeys) {
                  return Promise.all(
                    cacheKeys
                      .filter(function(key) { return key.startsWith('arab-sovia-'); })
                      .map(function(key) { return caches.delete(key); })
                  );
                }).catch(function() {});
              }
            `}
          </Script>
        ) : (
          <Script id="service-worker-registration" strategy="afterInteractive">
            {`
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `}
          </Script>
        )}
      </body>
    </html>
  )
}
