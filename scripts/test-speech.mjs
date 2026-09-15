// Optional integration check: downloads the free model; runs locally without paid APIs.
import { KokoroTTS } from 'kokoro-js';
import { env } from '@huggingface/transformers';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
env.cacheDir = './.model-cache';
console.log('Loading the local q8 speech model (first run downloads assets)…');
const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'cpu' });
console.log('Model loaded. Generating a short sample…');
const audio = await tts.generate('Every great story begins with a voice.', {voice:'af_heart', speed: 1});
assert.equal(audio.sampling_rate, 24000);
assert.ok(audio.audio.length > 12000);
assert.ok(audio.audio.every(Number.isFinite));
assert.ok(audio.audio.some(value => Math.abs(value) > .01));
await mkdir('outputs', {recursive:true});
await audio.save('outputs/speech-test.wav');
console.log(`Passed: generated ${(audio.audio.length/24000).toFixed(2)} seconds of non-silent speech. Saved outputs/speech-test.wav.`);

