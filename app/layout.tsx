import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Free Text to Speech — FluxNote', description: 'Turn your words into natural speech. Free, open-source text-to-speech with local English voices and MP3 or WAV downloads.', icons: { icon: '/favicon.svg' }, openGraph: { title: 'Give your words a voice — FluxNote', description: 'Free text-to-speech. Local generation. MP3 and WAV downloads.' }, twitter: { card: 'summary', title: 'Free Text to Speech — FluxNote' } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
