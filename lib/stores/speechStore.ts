import { create } from 'zustand';
export type SpeechSettings = { text: string; voice: string; accent: string; gender: string; search: string; speed: number; pitch: number; format: 'wav' | 'mp3'; autoplay: boolean };
export const useSpeechStore = create<SpeechSettings & { update: (value: Partial<SpeechSettings>) => void }>((set) => ({
  text: '', voice: 'af_heart', accent: 'all', gender: 'All', search: '', speed: 1, pitch: 0, format: 'mp3', autoplay: true,
  update: (value) => set(value),
}));
