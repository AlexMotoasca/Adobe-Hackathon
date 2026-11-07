// Turns a local video file into one labelled storyboard JPEG (3×3 frames) in the browser.
// The raw video is never uploaded; the backend vision model reads the frames in order.
export const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const MAX_VIDEO_BYTES = 300 * 1024 * 1024;
const FRAMES = 9, COLS = 3, MAX_WIDTH = 1600, MAX_STORYBOARD_BYTES = 3.8 * 1024 * 1024;

// Sample the opening hook densely (0.3s, ~1.5s), then spread the rest to the final frame / end card.
export function frameTimes(duration, count = FRAMES) {
  const end = Math.max(0.1, duration - 0.15);
  const hook = [Math.min(0.3, end), Math.min(1.5, end)];
  const rest = Array.from({ length: count - 2 }, (_, i) => 2.5 + (end - 2.5) * i / (count - 3));
  const times = [...hook, ...rest].map(t => Math.min(end, Math.max(0, t)));
  return times.map(t => Math.round(t * 10) / 10).filter((t, i, all) => i === 0 || t > all[i - 1]);
}

function once(target, event, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('The video took too long to load. Try an MP4 (H.264) file.')), timeoutMs);
    target.addEventListener(event, () => { clearTimeout(timer); resolve(); }, { once: true });
    target.addEventListener('error', () => { clearTimeout(timer); reject(new Error('This browser cannot decode the video. Try an MP4 (H.264) or WebM file.')); }, { once: true });
  });
}

export async function videoToStoryboard(file, onProgress = () => {}) {
  if (file.size > MAX_VIDEO_BYTES) throw new Error('Video must be 300 MB or smaller.');
  const url = URL.createObjectURL(file);
  const video = Object.assign(document.createElement('video'), { muted: true, playsInline: true, preload: 'auto', src: url });
  try {
    await once(video, 'loadedmetadata');
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration < 0.5) throw new Error('The video must be at least half a second long.');
    if (duration > 600) throw new Error('Videos up to 10 minutes are supported.');
    const times = frameTimes(duration);
    const rows = Math.ceil(times.length / COLS);
    const cellW = Math.floor(MAX_WIDTH / COLS);
    const cellH = Math.round(cellW * video.videoHeight / video.videoWidth) || Math.round(cellW * 9 / 16);
    const scale = Math.min(1, MAX_WIDTH / (cellH * rows)); // keep the whole grid within 1600×1600
    const w = Math.round(cellW * scale), h = Math.round(cellH * scale);
    const canvas = Object.assign(document.createElement('canvas'), { width: w * COLS, height: h * rows });
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const [i, t] of times.entries()) {
      onProgress(i, times.length);
      video.currentTime = t;
      await once(video, 'seeked');
      const x = (i % COLS) * w, y = Math.floor(i / COLS) * h;
      ctx.drawImage(video, x, y, w, h);
      const label = `${i + 1} · ${t.toFixed(1)}s`;
      ctx.font = `600 ${Math.max(14, Math.round(w / 22))}px Inter, sans-serif`;
      const pad = 6, tw = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(x + 8, y + 8, tw + pad * 2, Math.max(14, Math.round(w / 22)) + pad * 2);
      ctx.fillStyle = '#fff'; ctx.textBaseline = 'top'; ctx.fillText(label, x + 8 + pad, y + 8 + pad);
    }
    let blob;
    for (const quality of [0.88, 0.75, 0.6]) {
      blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (blob && blob.size <= MAX_STORYBOARD_BYTES) break;
    }
    if (!blob || blob.size > MAX_STORYBOARD_BYTES) throw new Error('Could not compress the storyboard under 4 MiB.');
    return { blob, duration: Math.round(duration * 10) / 10, times };
  } finally {
    URL.revokeObjectURL(url);
    video.removeAttribute('src'); video.load();
  }
}
