export type Voice = { id: string; name: string; accent: 'US' | 'UK'; gender: 'Female' | 'Male'; description: string };
export const voices: Voice[] = [
  { id: 'af_heart', name: 'Heart', accent: 'US', gender: 'Female', description: 'Warm & expressive' },
  { id: 'af_bella', name: 'Bella', accent: 'US', gender: 'Female', description: 'Bright & clear' },
  { id: 'af_nicole', name: 'Nicole', accent: 'US', gender: 'Female', description: 'Soft & gentle' },
  { id: 'af_sarah', name: 'Sarah', accent: 'US', gender: 'Female', description: 'Calm & natural' },
  { id: 'af_sky', name: 'Sky', accent: 'US', gender: 'Female', description: 'Light & friendly' },
  { id: 'am_michael', name: 'Michael', accent: 'US', gender: 'Male', description: 'Steady & clear' },
  { id: 'am_fenrir', name: 'Fenrir', accent: 'US', gender: 'Male', description: 'Rich & confident' },
  { id: 'am_puck', name: 'Puck', accent: 'US', gender: 'Male', description: 'Lively & conversational' },
  { id: 'bf_emma', name: 'Emma', accent: 'UK', gender: 'Female', description: 'Smooth & composed' },
  { id: 'bf_isabella', name: 'Isabella', accent: 'UK', gender: 'Female', description: 'Clear & poised' },
  { id: 'bm_george', name: 'George', accent: 'UK', gender: 'Male', description: 'Warm & grounded' },
  { id: 'bm_fable', name: 'Fable', accent: 'UK', gender: 'Male', description: 'Expressive & narrative' },
];
