export async function request(path, options = {}) {
  const response = await fetch('/api' + path, { ...options, signal: options.signal || AbortSignal.timeout(30000) });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error?.message || 'Request failed (' + response.status + ')');
  if (!data) throw new Error('The server returned an invalid response.');
  return data;
}
export const create = campaign => request('/analyses', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(campaign)});
export function upload(id, kind, file) {
  const body = new FormData(); body.set('file', file);
  return request('/analyses/' + encodeURIComponent(id) + '/' + kind, {method:'POST', body});
}
export const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function uploadVideo(id, storyboard, duration, times) {
  const body = new FormData(); body.set('file', storyboard, 'storyboard.jpg');
  const query = new URLSearchParams({ duration: String(duration), frames: times.join(',') });
  return request('/analyses/' + encodeURIComponent(id) + '/video?' + query, {method:'POST', body});
}
export function uploadAudio(id, wav) {
  const body = new FormData(); body.set('file', wav, 'audio.wav');
  return request('/analyses/' + encodeURIComponent(id) + '/audio', {method:'POST', body, signal: AbortSignal.timeout(150000)});
}
export function uploadMedia(id, file) {
  const type = file.type || ({mp4:'video/mp4',m4v:'video/mp4',webm:'video/webm',mov:'video/quicktime'})[file.name.split('.').pop().toLowerCase()] || 'video/mp4';
  return request('/analyses/' + encodeURIComponent(id) + '/media', {method:'POST', headers:{'Content-Type':type}, body:file, signal: AbortSignal.timeout(600000)});
}
