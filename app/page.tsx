'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AudioLines, ArrowUpFromLine, BookOpen, Check, ChevronDown, Code2, Download, FileAudio, Headphones, Mic2, Moon, Play, Search, ShieldCheck, Sparkles, Sun, Trash2, Video, WandSparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { voices, type Voice } from '@/lib/voices';
import { useSpeechStore } from '@/lib/stores/speechStore';

const steps = [
  { title: 'Find your voice', text: 'Choose an American or British English voice. Filter by voice type, search by name, and preview a sample to hear its character.', extra: 'Adjust speed for your pacing. Pitch shifts the voice up or down and also changes playback duration.' },
  { title: 'Add your words', text: 'Type, paste, or import a UTF-8 .txt file. Add punctuation to guide natural pauses and keep each generation within 3,000 characters.', extra: 'Plain text is supported. SSML, PDFs, and Word documents are not supported.' },
  { title: 'Bring it to life', text: 'Preview the beginning of your text, or generate the entire passage. The speech model downloads on first use and then runs on your device.', extra: 'Keep this tab open while processing. You can cancel at any time.' },
  { title: 'Download & create', text: 'Listen to the result and download an MP3 or WAV file. Your most recent five generations remain available while this page is open.', extra: 'Save your audio before refreshing or closing the page.' },
];
const faqs = [
  ['Is this text-to-speech tool really free?', 'Yes. Generation runs locally using an open-weight speech model. No account or paid API key is required. You supply your device’s processing power and an internet connection for the initial model download.'],
  ['Does my text leave my device?', 'Your text is processed in a browser worker and is not sent to a speech API. Model, voice, and runtime files are downloaded from external hosts; those hosts receive ordinary asset requests, not your input text.'],
  ['Which languages and voices are available?', 'This version includes 12 American and British English voices. Other languages and voice cloning are not currently supported.'],
  ['Can I use the audio commercially?', 'The speech model is Apache-2.0 licensed. You remain responsible for rights to your input, your use of the output, and any applicable rights or laws. Review the model license and third-party notices included in the source.'],
  ['Why does the first generation take longer?', 'The first run downloads the speech model and runtime files, which can exceed 100 MB in total. Later runs can reuse your browser’s cache. Performance depends on your device and available memory.'],
  ['How long are my audio files saved?', 'Audio is held in this page’s memory, with a maximum of five results. Nothing is stored in an account. Download your files before refreshing, closing the page, or generating more results.'],
];
export default function Home() {
  const settings = useSpeechStore();
  const { text, voice, accent, gender, search, speed, pitch, format, autoplay, update } = settings;
  const [dark, setDark] = useState(false);
  const [step, setStep] = useState(0);
  const [expanded, setExpanded] = useState<number[]>([0]);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => voices.filter(v => (accent === 'all' || v.accent === accent) && (gender === 'All' || v.gender === gender) && v.name.toLowerCase().includes(search.toLowerCase())), [accent, gender, search]);
  const selected = useMemo(() => voices.find(v => v.id === voice)!, [voice]);
  const changeText = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => update({ text: e.target.value }), [update]);
  const changeSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => update({ search: e.target.value }), [update]);
  const changeAccent = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => { const next = e.target.value; update({ accent: next, voice: next === 'UK' ? 'bf_emma' : 'af_heart', gender: 'All', search: '' }); }, [update]);
  const changeGender = useCallback((e: React.MouseEvent<HTMLButtonElement>) => update({ gender: e.currentTarget.dataset.value }), [update]);
  const changeSpeed = useCallback((e: React.ChangeEvent<HTMLInputElement>) => update({ speed: Number(e.target.value) }), [update]);
  const changePitch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => update({ pitch: Number(e.target.value) }), [update]);
  const changeFormat = useCallback((e: React.MouseEvent<HTMLButtonElement>) => update({ format: e.currentTarget.dataset.value as 'mp3' | 'wav' }), [update]);
  const changeAutoplay = useCallback((e: React.ChangeEvent<HTMLInputElement>) => update({ autoplay: e.target.checked }), [update]);
  const toggleTheme = useCallback(() => setDark(v => !v), []);
  const pickFile = useCallback(() => fileInput.current?.click(), []);
  const importText = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; e.target.value = ''; if (!file) return; if (!file.name.toLowerCase().endsWith('.txt') || file.size > 50000) { setError('Choose a plain-text .txt file under 50 KB.'); return; } try { const value = await file.text(); if (value.length > 3000) { setError('This file exceeds 3,000 characters. Please shorten it before importing.'); return; } update({ text: value }); setError(''); } catch { setError('We couldn’t read this file. Try another .txt file.'); } }, [update]);
  const useExample = useCallback(() => update({ text: 'Every great story begins with a voice. Turn your ideas into something people can hear, feel, and remember. What will you create today?' }), [update]);
  const clearText = useCallback(() => update({ text: '' }), [update]);
  const changeStep = useCallback((e: React.MouseEvent<HTMLButtonElement>) => setStep(Number(e.currentTarget.dataset.index)), []);
  const stepKeys = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => { const current = Number(e.currentTarget.dataset.index); const next = e.key === 'ArrowRight' ? (current + 1) % steps.length : e.key === 'ArrowLeft' ? (current + steps.length - 1) % steps.length : e.key === 'Home' ? 0 : e.key === 'End' ? steps.length - 1 : null; if (next !== null) { e.preventDefault(); setStep(next); document.getElementById(`step-${next}`)?.focus(); } }, []);
  const toggleFaq = useCallback((e: React.MouseEvent<HTMLButtonElement>) => { const n = Number(e.currentTarget.dataset.index); setExpanded(old => old.includes(n) ? old.filter(x => x !== n) : [...old, n]); }, []);
  const toggleAll = useCallback(() => setExpanded(old => old.length === faqs.length ? [] : faqs.map((_, i) => i)), []);
  const chooseVoice = useCallback((id: string) => update({ voice: id }), [update]);
  return <div className={`site ${dark ? 'dark' : ''}`}><div className="container">
    <header className="header"><a href="#studio" className="brand"><span className="logo"><AudioLines size={26}/></span><span>Free text to speech<small>Give your words a voice.</small></span></a><nav><a className="current" href="#studio">Studio</a><a href="#guide">How it works</a><a href="#faq">FAQs</a></nav><div className="header-actions"><Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={dark ? 'Use light theme' : 'Use dark theme'}>{dark ? <Sun/> : <Moon/>}</Button><a className="source" href="#open-source"><Code2 size={15}/> Open source</a></div></header>
    <div className="intro"><div><span className="eyebrow">YOUR WORDS. A WORLD OF POSSIBILITIES.</span><h1>Good words deserve a great voice.</h1></div><span className="free-badge"><span/> Free to use. Yours to keep.</span></div>
    <main><section id="studio" className="studio"><aside className="panel options"><div className="panel-heading"><h2>Voice settings</h2><span>01</span></div><label className="field-label" htmlFor="language">Language & accent</label><select id="language" value={accent} onChange={changeAccent}><option value="all">English · All accents</option><option value="US">English · American</option><option value="UK">English · British</option></select><label className="field-label">Voice type</label><div className="segmented" role="group" aria-label="Voice type">{['All', 'Female', 'Male'].map(g => <Button key={g} variant="ghost" data-value={g} onClick={changeGender} aria-pressed={gender === g}>{g}</Button>)}</div><label className="field-label" htmlFor="voice-search">Find a voice</label><div className="search-box"><Search size={15}/><input id="voice-search" value={search} onChange={changeSearch} placeholder="Search voices…"/></div><div className="voice-list" aria-label="Available voices">{filtered.map(v => <VoiceOption key={v.id} voice={v} selected={v.id === voice} onChoose={chooseVoice}/>)}{!filtered.length && <p className="empty-search">No voices found. Try another name.</p>}</div><div className="selected-note"><Check size={12}/> Selected: {selected.name} · {selected.accent}</div>
    <div className="range-heading"><label htmlFor="speed">Speed</label><output>{speed.toFixed(2)}×</output></div><input id="speed" className="range" type="range" min="0.5" max="1.5" step="0.05" value={speed} onChange={changeSpeed}/><div className="range-ends"><span>Slower</span><span>Faster</span></div><div className="range-heading"><label htmlFor="pitch">Pitch</label><output>{pitch > 0 ? '+' : ''}{pitch} st</output></div><input id="pitch" className="range" type="range" min="-6" max="6" step="1" value={pitch} onChange={changePitch}/><div className="range-ends"><span>Lower</span><span>Higher</span></div><p className="pitch-note">Pitch also changes playback duration.</p><label className="field-label">Download format</label><div className="segmented formats" role="group" aria-label="Download format">{(['mp3', 'wav'] as const).map(f => <Button key={f} variant="ghost" data-value={f} onClick={changeFormat} aria-pressed={format === f}>{f.toUpperCase()}<span>{f === 'mp3' ? 'Smaller file' : 'Uncompressed'}</span></Button>)}</div><label className="checkbox"><input type="checkbox" checked={autoplay} onChange={changeAutoplay}/> Play audio when ready</label></aside>
    <section className="panel editor"><div className="editor-heading"><div><h2>Your text</h2><p>Write something worth listening to.</p></div><Button variant="outline" className="import" onClick={pickFile}><ArrowUpFromLine size={13}/> Import .txt</Button><input ref={fileInput} type="file" accept=".txt,text/plain" className="sr-only" onChange={importText} aria-label="Import text file"/></div><div className="text-wrap"><textarea aria-label="Text to synthesize" value={text} onChange={changeText} maxLength={3000} placeholder="A story. An idea. A few words that matter.&#10;&#10;Type or paste your text here, and let’s bring it to life…"/><div className="text-footer"><Button variant="ghost" className="example" onClick={useExample}><Sparkles size={13}/> Try an example</Button><span>{text.length.toLocaleString()} / 3,000 characters</span><Button variant="ghost" size="icon-xs" onClick={clearText} disabled={!text} aria-label="Clear text"><Trash2 size={12}/></Button></div></div>
    <GenerationArea selected={selected} onError={setError}/>{error && <p className="error" role="alert">{error}</p>}<div className="privacy"><ShieldCheck size={14}/><span>Generated on your device. Your words stay yours.</span><span className="engine-note">Local AI</span></div></section></section>
    <section className="panel guide" id="guide"><div className="section-heading"><div><span className="eyebrow">FROM TEXT TO SOMETHING MORE</span><h2>Four steps. Endless possibilities.</h2></div><BookOpen size={21}/></div><div className="steps" role="tablist" aria-label="Usage steps">{steps.map((s, i) => <button key={s.title} id={`step-${i}`} role="tab" aria-controls="step-panel" aria-selected={i === step} data-index={i} onClick={changeStep} onKeyDown={stepKeys} tabIndex={i === step ? 0 : -1}><span>{i + 1}</span>{s.title}</button>)}</div><div className="step-detail" role="tabpanel" id="step-panel" aria-labelledby={`step-${step}`}><span className="step-number">0{step + 1}</span><div><h3>{steps[step].title}</h3><p>{steps[step].text}</p><p>{steps[step].extra}</p></div></div></section>
    <section className="use-cases"><div className="section-heading"><div><span className="eyebrow">MADE FOR YOUR NEXT IDEA</span><h2>One voice. So many ways to create.</h2></div></div><div className="case-grid">{[{icon:Video,title:'Videos with a voice',text:'Add a clear voiceover to your next video or short.',className:'purple'},{icon:Headphones,title:'Stories worth hearing',text:'Bring chapters, characters, and ideas to life.',className:'peach'},{icon:Mic2,title:'Audio, on your terms',text:'Create intros, explainers, and podcast drafts.',className:'green'},{icon:BookOpen,title:'Learning that listens',text:'Turn study notes into audio you can take anywhere.',className:'blue'}].map(c => <article key={c.title}><span className={`case-icon ${c.className}`}><c.icon size={21}/></span><h3>{c.title}</h3><p>{c.text}</p></article>)}</div></section>
    <section className="panel faq" id="faq"><div className="section-heading"><h2>A few things you might be wondering.</h2><Button variant="ghost" onClick={toggleAll}>{expanded.length === faqs.length ? 'Collapse all' : 'Expand all'}</Button></div>{faqs.map(([q, a], i) => <div className="faq-item" key={q}><button onClick={toggleFaq} data-index={i} aria-expanded={expanded.includes(i)} aria-controls={`faq-${i}`}>{q}<ChevronDown size={17} className={expanded.includes(i) ? 'rotate' : ''}/></button>{expanded.includes(i) && <p id={`faq-${i}`}>{a}</p>}</div>)}</section>
    <section className="open-source" id="open-source"><div><Code2 size={22}/><h2>Open source. Open possibilities.</h2><p>Built for creators, free for everyone. Make it your own.</p></div><a href="/source.zip" download>Download the source <Download size={15}/></a></section></main>
    <footer><a className="footer-brand" href="https://fluxnote.io"><AudioLines size={19}/> A little tool by <strong>FluxNote</strong></a><span>Words in. Possibilities out.</span><a href="mailto:support@fluxnote.io">Support ↗</a></footer>
  </div></div>;
}
function VoiceOption({ voice, selected, onChoose }: { voice: Voice; selected: boolean; onChoose: (id: string) => void }) {
  const choose = useCallback(() => onChoose(voice.id), [onChoose, voice.id]);
  return <button className={`voice-option ${selected ? 'selected' : ''}`} onClick={choose} aria-pressed={selected}><span className={`avatar ${voice.gender === 'Male' ? 'male' : ''}`}>{voice.name.slice(0, 1)}</span><span><strong>{voice.name}<small>{voice.accent}</small></strong><em>{voice.description}</em></span>{selected ? <span className="voice-check"><Check size={12}/></span> : <span className="voice-gender">{voice.gender}</span>}</button>;
}
type AudioResult = { id: number; url: string; text: string; name: string; duration: number; format: 'wav' | 'mp3'; bytes: number };
function GenerationArea({ selected, onError }: { selected: Voice; onError: (message: string) => void }) {
  const { text, voice, speed, pitch, format, autoplay } = useSpeechStore();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const [results, setResults] = useState<AudioResult[]>([]);
  const [preview, setPreview] = useState('');
  const worker = useRef<Worker | null>(null);
  const running = useRef(false);
  const urls = useRef(new Set<string>());
  const player = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => { worker.current?.terminate(); player.current?.pause(); urls.current.forEach(url => URL.revokeObjectURL(url)); }, []);
  const cancel = useCallback(() => { worker.current?.terminate(); worker.current = null; running.current = false; setBusy(false); setStatus('Cancelled. You can start a new generation.'); setProgress(null); }, []);
  const start = useCallback((isPreview: boolean) => {
    if (running.current) return;
    const input = isPreview ? (text.trim().slice(0, 180) || `Hello, I'm ${selected.name}. Every great story starts with a voice. What will you create today?`) : text.trim();
    if (!input || input.length > 3000) { onError('Enter between 1 and 3,000 characters to generate speech.'); return; }
    onError(''); running.current = true; setBusy(true); setStatus('Preparing your voice…'); setProgress(null);
    player.current?.pause();
    const chosenFormat = isPreview ? 'wav' : format;
    try {
      if (!worker.current) worker.current = new Worker(new URL('../lib/speech.worker.ts', import.meta.url), { type: 'module' });
      const current = worker.current;
      current.onerror = () => { onError('The speech worker could not start. Reload the page and try again in an updated browser.'); current.terminate(); worker.current = null; running.current = false; setBusy(false); setStatus(''); };
      current.onmessage = (event) => {
        const data = event.data;
        if (data.type === 'status') { setStatus(data.text); setProgress(data.progress); }
        if (data.type === 'error') { current.terminate(); worker.current = null; onError(data.text); setBusy(false); running.current = false; setStatus(''); }
        if (data.type === 'result') {
          const blob = new Blob([data.bytes], { type: chosenFormat === 'wav' ? 'audio/wav' : 'audio/mpeg' });
          const url = URL.createObjectURL(blob); urls.current.add(url);
          if (isPreview) { setPreview(old => { if (old) { URL.revokeObjectURL(old); urls.current.delete(old); } return url; }); }
          else {
            const result: AudioResult = { id: Date.now(), url, text: input, name: selected.name, duration: data.duration, format: chosenFormat, bytes: blob.size };
            setResults(old => { const next = [result, ...old]; next.slice(5).forEach(r => { URL.revokeObjectURL(r.url); urls.current.delete(r.url); }); return next.slice(0, 5); });
          }
          setBusy(false); running.current = false; setStatus(isPreview ? 'Preview ready.' : 'Your audio is ready to download.'); setProgress(null);
          if (autoplay || isPreview) { player.current = new Audio(url); void player.current.play().catch(() => setStatus('Audio is ready. Press play to listen.')); }
        }
      };
      current.postMessage({ text: input, voice, speed, pitch, format: chosenFormat });
    } catch { onError('Your browser could not initialize the speech worker. Try an updated desktop browser.'); running.current = false; setBusy(false); setStatus(''); }
  }, [text, voice, speed, pitch, format, autoplay, selected.name, onError]);
  const generate = useCallback(() => start(false), [start]);
  const previewVoice = useCallback(() => start(true), [start]);
  const stopPlayback = useCallback(() => player.current?.pause(), []);
  const remove = useCallback((id: number) => { player.current?.pause(); setResults(old => { const item = old.find(r => r.id === id); if (item) { URL.revokeObjectURL(item.url); urls.current.delete(item.url); } return old.filter(r => r.id !== id); }); }, []);
  return <><div className="generate-actions"><Button variant="outline" onClick={previewVoice} disabled={busy}><Play size={15}/> Preview {text.trim() ? 'text' : 'voice'}</Button><Button onClick={generate} disabled={busy || !text.trim()}><WandSparkles size={16}/> {busy ? 'Creating your audio…' : 'Generate speech'}</Button></div>
    {status && <div className="status-box" role="status">{status}{busy && <><progress max="100" value={progress ?? undefined} aria-label="Speech generation progress"/><Button variant="ghost" onClick={cancel}><X size={13}/> Cancel</Button></>}</div>}
    {preview && <audio className="preview-player" controls src={preview} onPlay={stopPlayback} aria-label="Voice preview"/>}
    <div className="results-heading"><h2>Your audio</h2><span>{results.length} {results.length === 1 ? 'file' : 'files'}</span></div>
    {results.length ? results.map(r => <AudioCard key={r.id} result={r} onRemove={remove} onPlay={stopPlayback}/>) : <div className="empty-results"><span><FileAudio size={23}/></span><div><strong>A little quiet here. For now.</strong><p>Your generated audio will appear here, ready to play and download.</p></div></div>}
    <p className="model-hint">First use downloads the speech model (100+ MB with runtime assets). Keep this tab open. Save audio before leaving.</p>
  </>;
}
function AudioCard({ result, onRemove, onPlay }: { result: AudioResult; onRemove: (id: number) => void; onPlay: () => void }) {
  const remove = useCallback(() => onRemove(result.id), [onRemove, result.id]);
  return <article className="result"><div className="result-top"><FileAudio size={15}/><strong>{result.name} · {result.format.toUpperCase()}</strong><span>{result.duration.toFixed(1)} sec · {(result.bytes / 1024).toFixed(0)} KB</span></div><p>{result.text}</p><audio controls src={result.url} onPlay={onPlay} aria-label={`Generated speech with ${result.name}`}/><div className="result-actions"><a href={result.url} download={`fluxnote-${result.name.toLowerCase()}-${result.id}.${result.format}`}><Download size={13}/> Download {result.format.toUpperCase()}</a><Button variant="ghost" size="sm" onClick={remove}><Trash2 size={12}/> Remove</Button></div></article>;
}
