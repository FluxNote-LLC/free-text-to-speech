import { cp, mkdir, readdir } from 'node:fs/promises';
await mkdir('public/onnx', { recursive: true });
for (const file of await readdir('node_modules/onnxruntime-web/dist')) {
  if (/^ort-wasm.*\.(wasm|mjs)$/.test(file)) await cp(`node_modules/onnxruntime-web/dist/${file}`, `public/onnx/${file}`);
}
