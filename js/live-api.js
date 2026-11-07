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
