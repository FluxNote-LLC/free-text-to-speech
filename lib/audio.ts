/** PCM processing shared by the worker and offline checks. */
export function shiftPitch(samples: Float32Array, semitones: number): Float32Array {
  const ratio = 2 ** (semitones / 12);
  const result = new Float32Array(Math.floor(samples.length / ratio));
  for (let i = 0; i < result.length; i++) {
    const position = i * ratio;
    const index = Math.floor(position);
    const fraction = position - index;
    result[i] = samples[index] * (1 - fraction) + (samples[Math.min(index + 1, samples.length - 1)] ?? 0) * fraction;
  }
  return result;
}
export function pcm16(samples: Float32Array): Int16Array {
  const output = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) { const value = Math.max(-1, Math.min(1, samples[i])); output[i] = value < 0 ? value * 32768 : value * 32767; }
  return output;
}
export function encodeWav(samples: Float32Array, sampleRate: number): Uint8Array {
  const pcm = pcm16(samples);
  const bytes = new Uint8Array(44 + pcm.length * 2);
  const view = new DataView(bytes.buffer);
  const word = (offset: number, value: string) => { for (let i = 0; i < value.length; i++) bytes[offset + i] = value.charCodeAt(i); };
  word(0, 'RIFF'); view.setUint32(4, 36 + pcm.length * 2, true); word(8, 'WAVE'); word(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true); word(36, 'data'); view.setUint32(40, pcm.length * 2, true);
  for (let i = 0; i < pcm.length; i++) view.setInt16(44 + i * 2, pcm[i], true);
  return bytes;
}
export function splitText(text: string): string[] {
  // Bound every chunk to avoid the model's token truncation on long sentences.
  const words = text.trim().split(/\s+/);
  const chunks: string[] = []; let chunk = '';
  for (const word of words) {
    if (word.length > 180) throw new Error('A word is too long. Add spaces to long strings before generating.');
    if (chunk.length + word.length + 1 > 180) { chunks.push(chunk); chunk = ''; }
    chunk += (chunk ? ' ' : '') + word;
    if (/[.!?;:]$/.test(word) && chunk.length > 40) { chunks.push(chunk); chunk = ''; }
  }
  if (chunk) chunks.push(chunk);
  return chunks;
}
