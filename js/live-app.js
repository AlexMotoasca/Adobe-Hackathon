import {request, create, upload, escape as e} from './live-api.js';
import {reportView} from './live-report.js';
const app = document.querySelector('#app');
let generation = 0, timer;
const fields = [['brand','Brand',200],['product','Product',500],['category','Category',200],['targetAudience','Target audience',2000],['objective','Objective',2000],['market','Market',200],['language','Language',100]];
const shell = body => '<header class="live-header"><a href="/dashboard">MindMarket<span> / Consumer intelligence</span></a><nav><a href="/dashboard">Analyses</a><a class="action" href="/analysis/new">New analysis</a></nav></header><main class="live-main">' + body + '</main>';
const loading = text => '<p role="status" class="loading">' + e(text) + '</p>';
const error = err => '<p role="alert" class="error">' + e(err.message) + '</p>';
function go(path) { history.pushState({},'',path); render(); }
document.addEventListener('click', event => {
  const a = event.target.closest('a');
  if (a && a.getAttribute('href')?.startsWith('/') && !event.ctrlKey && !event.metaKey) {event.preventDefault();go(a.getAttribute('href'));}
});
window.addEventListener('popstate', render);
async function render() {
  const token = ++generation; clearTimeout(timer);
  const path = location.pathname;
  app.innerHTML = shell(loading('Loading saved data…'));
  try {
    if (path === '/analysis/new') { newAnalysis(); return; }
    if (path.startsWith('/analysis/')) { await detail(path.split('/')[2], token); return; }
    const offset = Math.max(0, Number(new URLSearchParams(location.search).get('offset')) || 0);
    const data = await request('/analyses?limit=20&offset=' + offset);
    if (token !== generation) return;
    app.innerHTML = shell('<div class="heading"><div><p class="eyebrow">Workspace</p><h1>Saved analyses</h1><p>Campaigns and results stored in your database.</p></div><button id="refresh">Refresh</button></div><section class="panel">' +
      (data.items.length ? '<div class="table-wrap"><table><thead><tr><th>Product / brand</th><th>Status</th><th>Stage</th><th>Reviews</th><th>Updated</th></tr></thead><tbody>' + data.items.map(a => '<tr><td><a href="/analysis/' + e(a.id) + '">' + e(a.campaign.product) + '</a><small>' + e(a.campaign.brand) + '</small></td><td>' + e(a.status) + '</td><td>' + e(a.stage.replaceAll('_',' ')) + '</td><td>' + e(a.reviewStats?.accepted ?? 0) + '</td><td>' + e(new Date(a.updatedAt).toLocaleString()) + '</td></tr>').join('') + '</tbody></table></div>' : '<h2>No saved analyses</h2><p>Create an analysis to upload a creative and optional customer reviews.</p>') +
      '</section><nav class="pagination">' + (offset ? '<a href="/dashboard?offset=' + Math.max(0,offset-20) + '">Previous</a>' : '') + (data.items.length === 20 ? '<a href="/dashboard?offset=' + (offset+20) + '">Next</a>' : '') + '</nav>');
    document.querySelector('#refresh').onclick = render;
  } catch(err) { if(token === generation) { app.innerHTML = shell(error(err) + '<button id="retry">Try again</button>'); document.querySelector('#retry').onclick=render; } }
}
function filesForm(required = false) {
  return '<label>Creative image (PNG, JPEG or WebP; up to 4 MiB)<input type="file" name="image" accept="image/png,image/jpeg,image/webp" ' + (required?'required':'') + '></label><label>Customer reviews (optional CSV or JSON; up to 1 MiB, 100 rows)<input type="file" name="reviews" accept=".csv,.json"></label>';
}
function validateFiles(form) {
  for(const [key,max] of [['image',4*1024*1024],['reviews',1024*1024]]) {
    const file=form.elements[key].files[0]; if(file && file.size>max) throw new Error(key + ' exceeds the upload size limit.');
  }
}
function newAnalysis() {
  app.innerHTML=shell('<h1>New analysis</h1><p>Save campaign context, then upload your creative and run the analysis.</p><form class="panel" id="create"><div class="form-grid">' + fields.map(([key,label,max]) => '<label>' + label + '<input name="' + key + '" required maxlength="' + max + '"></label>').join('') + '</div><label>Product description (optional)<textarea name="productDescription" maxlength="4000"></textarea></label><label>Product URL (optional)<input name="productUrl" type="url"></label><button type="submit">Save campaign and continue</button><div id="feedback" aria-live="polite"></div></form>');
  document.querySelector('#create').onsubmit=async event=>{
    event.preventDefault(); const form=event.currentTarget, button=form.querySelector('button'), feedback=form.querySelector('#feedback');
    button.disabled=true; feedback.innerHTML=loading('Saving campaign…');
    try {const values=Object.fromEntries(new FormData(form)); for(const k of Object.keys(values)) if(!values[k].trim()) delete values[k]; const a=await create(values);go('/analysis/'+a.id);}
    catch(err){feedback.innerHTML=error(err);button.disabled=false;}
  };
}
async function detail(id, token) {
  const base='/analyses/'+encodeURIComponent(id);
  const a=await request(base);
  if(token!==generation)return;
  app.innerHTML=shell('<p class="eyebrow">'+e(a.campaign.brand)+'</p><h1>'+e(a.campaign.product)+'</h1><section class="panel"><div role="status"><b>'+e(a.status)+'</b> · '+e(a.stage.replaceAll('_',' '))+' · '+e(a.completedPersonas)+'/5 personas</div><p>'+e(a.campaign.objective)+'</p><p>'+e(a.reviewStats?.accepted??0)+' saved customer reviews</p>'+(a.error?error(a.error):'')+(a.hasImage?'<img class="creative" alt="Saved campaign creative" src="/api'+base+'/image">':'')+'</section><div id="detail-body"></div>');
  const body=document.querySelector('#detail-body');
  if(a.status==='completed') {body.innerHTML=loading('Loading report…'); const r=await request(base+'/report'); if(token===generation)body.innerHTML=reportView(r);return;}
  if(a.status==='running'||a.status==='queued') {
    body.innerHTML=loading('Analysis in progress. Checking for updates every 2.5 seconds…');
    timer=setTimeout(()=>{if(token===generation)detail(id,token).catch(err=>{body.innerHTML=error(err)+'<button id="poll-retry">Reconnect</button>';document.querySelector('#poll-retry').onclick=render;});},2500);return;
  }
  body.innerHTML='<form class="panel" id="uploads"><h2>Creative and evidence</h2>'+filesForm(!a.hasImage)+'<p>Uploading replacements resets partial results. Reviews require a text column.</p><button type="submit">Save uploads</button><div id="upload-feedback" aria-live="polite"></div></form><section class="panel"><button id="start" '+(!a.hasImage?'disabled':'')+'>'+(a.status==='failed'?'Retry analysis':'Start analysis')+'</button><p>Save a creative before starting. Without reviews, results will be labeled unvalidated.</p><div id="start-feedback" aria-live="polite"></div></section>';
  document.querySelector('#uploads').onsubmit=async event=>{
    event.preventDefault();const form=event.currentTarget, button=form.querySelector('button'), feedback=form.querySelector('#upload-feedback'), start=document.querySelector('#start');
    button.disabled=true;start.disabled=true;
    try{validateFiles(form);for(const kind of ['image','reviews']) {const file=form.elements[kind].files[0];if(file){feedback.innerHTML=loading('Uploading '+kind+'…');await upload(id,kind,file);}}await render();}
    catch(err){feedback.innerHTML=error(err);button.disabled=false;start.disabled=!a.hasImage;}
  };
  document.querySelector('#start').onclick=async event=>{
    event.currentTarget.disabled=true;document.querySelector('#uploads button').disabled=true;
    const feedback=document.querySelector('#start-feedback');feedback.innerHTML=loading('Queueing analysis…');
    try{await request(base+'/start',{method:'POST'});await render();}catch(err){feedback.innerHTML=error(err);document.querySelector('#start').disabled=false;document.querySelector('#uploads button').disabled=false;}
  };
}
render();
