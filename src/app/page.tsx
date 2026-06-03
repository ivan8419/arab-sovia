import { DashboardView } from '@/components/dashboard-view'

const baseUrl = 'https://arab-sovia88.vercel.app'

export default function Home() {
  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Arab Sovia - Belajar Kata Kerja Arab',
    description:
      "Belajar konjugasi kata kerja bahasa Arab (Fi'il) dengan 14 dhomir secara interaktif. Dilengkapi quiz, mini games, dan progress tracker.",
    url: baseUrl,
    provider: {
      '@type': 'Organization',
      name: 'Arab Sovia',
      url: baseUrl,
    },
    educationalLevel: 'Beginner',
    teaches: [
      "Arabic Verbs (Fi'il)",
      'Dhomir (Arabic Pronouns)',
      'Arabic Conjugation',
      'Bahasa Arab',
    ],
    inLanguage: ['id', 'ar'],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      courseWorkload: 'PT10H',
      instructor: {
        '@type': 'Person',
        name: 'Arab Sovia',
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <DashboardView />
    </>
  )
}
