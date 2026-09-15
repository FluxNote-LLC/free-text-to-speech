/// <reference lib="webworker" />
import { KokoroTTS, env } from 'kokoro-js';
import { env as runtimeEnv } from '@huggingface/transformers';
import { Mp3Encoder } from '@breezystack/lamejs';
import { encodeWav, pcm16, shiftPitch, splitText } from './audio';

const worker = self as unknown as DedicatedWorkerGlobalScope;
let model: KokoroTTS | null = null;
let working = false;
env.wasmPaths = '/onnx/';
runtimeEnv.backends.onnx.wasm!.numThreads = 1;
worker.onmessage = async (event: MessageEvent<{text: string; voice: string; speed: number; pitch: number; format: 'wav' | 'mp3'}>) => {
  if (working) return;
  working = true;
  try {
    const { text, voice, speed, pitch, format } = event.data;
    if (!text.trim() || text.length > 3000) throw new Error('Enter between 1 and 3,000 characters.');
    const chunks = splitText(text);
    if (!model) {
      worker.postMessage({ type: 'status', text: 'Downloading and preparing the speech model…', progress: null });
      model = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
        dtype: 'q8', device: 'wasm',
        progress_callback: (p: { status: string; progress?: number; file?: string }) => {
          if (p.status === 'progress') worker.postMessage({ type: 'status', text: 'Downloading speech model assets…', progress: p.progress == null ? null : Math.round(p.progress) });
          if (p.status === 'done') worker.postMessage({ type: 'status', text: 'Preparing the local speech engine…', progress: null });
        },
      });
    }
    const audioChunks: Float32Array[] = [];
    let sampleRate = 24000;
    for (let i = 0; i < chunks.length; i++) {
      worker.postMessage({ type: 'status', text: `Generating speech · passage ${i + 1} of ${chunks.length}`, progress: Math.round(i / chunks.length * 100) });
      const audio = await model.generate(chunks[i], { voice: voice as keyof typeof model.voices, speed });
      audioChunks.push(audio.audio); sampleRate = audio.sampling_rate;
      if (i < chunks.length - 1) audioChunks.push(new Float32Array(Math.round(sampleRate * 0.12)));
    }
    worker.postMessage({ type: 'status', text: 'Preparing your audio file…', progress: 100 });
    const combined = new Float32Array(audioChunks.reduce((sum, c) => sum + c.length, 0));
    let offset = 0; for (const c of audioChunks) { combined.set(c, offset); offset += c.length; }
    const samples = shiftPitch(combined, pitch);
    let bytes: Uint8Array;
    if (format === 'wav') bytes = encodeWav(samples, sampleRate);
    else {
      const encoder = new Mp3Encoder(1, sampleRate, 128);
      const pcm = pcm16(samples); const parts: Uint8Array[] = [];
      for (let i = 0; i < pcm.length; i += 1152) parts.push(new Uint8Array(encoder.encodeBuffer(pcm.subarray(i, i + 1152))));
      parts.push(new Uint8Array(encoder.flush()));
      bytes = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
      let position = 0; for (const part of parts) { bytes.set(part, position); position += part.length; }
    }
    worker.postMessage({ type: 'result', bytes, duration: samples.length / sampleRate, format }, [bytes.buffer]);
  } catch (error) {
    worker.postMessage({ type: 'error', text: error instanceof Error && /word is too long|Enter between/.test(error.message) ? error.message : 'Speech generation failed. Check your connection, allow model downloads, or try a shorter passage with other tabs closed.' });
    model = null;
  } finally { working = false; }
};
