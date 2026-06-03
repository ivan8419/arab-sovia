import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Geist } from 'next/font/google'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/providers'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

const baseUrl = 'https://arab-sovia88.vercel.app'

export const metadata: Metadata = {
  title: {
    default: 'Arab Sovia - Belajar Kata Kerja Arab',
    template: '%s | Arab Sovia',
  },
  description:
    "Belajar konjugasi kata kerja bahasa Arab (Fi'il) dengan 14 dhomir secara interaktif. Dilengkapi quiz, mini games, dan progress tracker.",
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  verification: {
    google: '_IOv3JoPGLPQxeMl-IWoDcP_VQG_yY-Lk6M_CuBDexs',
  },
  openGraph: {
    title: 'Arab Sovia - Belajar Kata Kerja Arab',
    description:
      "Belajar konjugasi kata kerja bahasa Arab (Fi'il) dengan 14 dhomir secara interaktif. Dilengkapi quiz, mini games, dan progress tracker.",
    url: baseUrl,
    siteName: 'Arab Sovia',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/icon.svg`,
        width: 512,
        height: 512,
        alt: 'Arab Sovia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arab Sovia - Belajar Kata Kerja Arab',
    description:
      "Belajar konjugasi kata kerja bahasa Arab (Fi'il) dengan 14 dhomir secara interaktif.",
    images: [`${baseUrl}/icon.svg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" dir="ltr" className={cn('font-sans', geist.variable)}>
      <head>
        <meta name="theme-color" content="#58CC02" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="canonical" href="https://arab-sovia88.vercel.app" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Arab Sovia - Belajar Kata Kerja Arab',
              url: 'https://arab-sovia88.vercel.app',
              description:
                "Belajar konjugasi kata kerja bahasa Arab (Fi'il) dengan 14 dhomir secara interaktif.",
              inLanguage: ['id', 'ar'],
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate:
                    'https://arab-sovia88.vercel.app/verbs?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
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
        <ThemeProvider>{children}</ThemeProvider>
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
