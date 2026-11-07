import {request, create, upload, uploadVideo, escape as e} from './live-api.js';
import {reportView} from './live-report.js';
import {videoToStoryboard, VIDEO_TYPES} from './video-storyboard.js';
const app = globalThis.document?.querySelector('#app');
let generation = 0, timer;
const IMAGE_TYPES = ['image/png','image/jpeg','image/webp'];
const fields = [['brand','Brand',200],['product','Product',500],['category','Category',200],['targetAudience','Target audience',2000],['objective','Objective',2000],['market','Market',200],['language','Language',100]];
const shell = body => '<header class="live-header"><a href="/dashboard">MindMarket<span> / Ad feedback</span></a><nav><a href="/dashboard">Reviews</a><a class="action" href="/analysis/new">New ad review</a></nav></header><main class="live-main">' + body + '</main>';
const loading = text => '<p role="status" class="loading">' + e(text) + '</p>';
const error = err => '<p role="alert" class="error">' + e(err.message) + '</p>';
const rerunButton = (a, cls='') => ['completed','failed'].includes(a.status) && a.hasImage ? '<button type="button" class="'+cls+'" data-rerun="'+e(a.id)+'">Rerun</button>' : '';
const STATUS = {completed:['Ready','ok'],running:['Analysing','run'],queued:['Queued','run'],failed:['Failed','bad'],draft:['Draft','idle']};
const mediaLabel = a => a.creative?.kind==='video' ? '▶ Video'+(a.creative.durationSeconds?' · '+Math.round(a.creative.durationSeconds)+'s':'') : 'Image';
function ago(date) {
  const s = (Date.now() - new Date(date)) / 1000;
  if (s < 60) return 'just now';
  for (const [unit, size] of [['day',86400],['hour',3600],['min',60]]) if (s >= size) { const n=Math.floor(s/size); return n+' '+unit+(n>1&&unit!=='min'?'s':'')+' ago'; }
}
function bindReruns() {
  document.querySelectorAll('[data-rerun]').forEach(button => {
    button.onclick = async event => {
      event.preventDefault(); event.stopPropagation();
      button.disabled = true; button.textContent = 'Starting…';
      try { const a = await request('/analyses/'+encodeURIComponent(button.dataset.rerun)+'/rerun',{method:'POST'}); go('/analysis/'+a.id); }
      catch(err) { button.textContent = 'Rerun'; button.disabled = false; button.title = err.message; alert(err.message); }
    };
  });
}
const STEPS=[['ad_interpretation','Watching your ad and searching the web'],['category_research','Collecting customer opinions'],['consumer_insights','Finding what buyers care about'],['personas','Getting feedback from 5 audience profiles'],['evidence_validation','Checking feedback against evidence'],['synthesis','Writing your recommendations']];
function progressSteps(a) {
  const current=a.status==='queued'?-1:STEPS.findIndex(([key])=>key===a.stage);
  return '<ol class="progress-steps">'+(a.status==='queued'?'<li class="active">Waiting for a worker…</li>':'')+STEPS.map(([key,label],i)=>'<li class="'+(i<current?'done':i===current?'active':'')+'">'+e(label)+(key==='personas'&&i<=current?' ('+e(a.completedPersonas)+'/5)':'')+'</li>').join('')+'</ol>';
}
function go(path) { history.pushState({},'',path); render(); }
globalThis.document?.addEventListener('click', event => {
  const a = event.target.closest('a');
  if (a?.getAttribute('href')?.startsWith('#')) {
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (target) { event.preventDefault(); for(let node=target;node;node=node.parentElement) if(node.tagName==='DETAILS') node.open=true; target.scrollIntoView({behavior:'auto',block:'start'}); }
    return;
  }
  if (a && a.getAttribute('href')?.startsWith('/') && !event.ctrlKey && !event.metaKey) {event.preventDefault();go(a.getAttribute('href'));}
});
globalThis.window?.addEventListener('popstate', render);

async function render() {
  const token = ++generation; clearTimeout(timer);
  const path = location.pathname;
  if (path !== '/dashboard' || !app.querySelector('.dash')) app.innerHTML = shell(loading('Loading…'));
  try {
    if (path === '/analysis/new') { newAnalysis(); return; }
    if (path.startsWith('/analysis/')) { await detail(path.split('/')[2], token); return; }
    await dashboard(token);
  } catch(err) { if(token === generation) { app.innerHTML = shell(error(err) + '<button id="retry">Try again</button>'); document.querySelector('#retry').onclick=render; } }
}

export function dashboardView(items, {offset=0, filter='all'}={}) {
  const groups = {all:()=>true, completed:a=>a.status==='completed', active:a=>['running','queued'].includes(a.status), draft:a=>a.status==='draft', failed:a=>a.status==='failed'};
  const count = key => items.filter(groups[key]).length;
  const shown = items.filter(groups[filter] || groups.all);
  const hero = '<section class="dash-hero"><div><p class="eyebrow">Ad feedback studio</p><h1>Your ad reviews</h1><p>Upload an image or video ad. Five audience psychologies tell you what works, what doesn’t, and how to market it better.</p></div><a class="action dash-cta" href="/analysis/new">+ New ad review</a></section>';
  if (!items.length && !offset) return hero + '<section class="panel dash-empty"><h2>No ad reviews yet</h2><ol class="dash-howto"><li><b>Describe the campaign</b><span>Brand, product, audience and goal.</span></li><li><b>Upload your ad</b><span>An image, or a video up to 10 minutes.</span></li><li><b>Get feedback</b><span>Strengths, weaknesses and concrete fixes from 5 audience profiles.</span></li></ol><a class="action" href="/analysis/new">Review your first ad</a></section>';
  const stats = '<div class="dash-stats">'+[['Reviews',items.length],['Ready',count('completed')],['In progress',count('active')],['Needs attention',count('draft')+count('failed')]].map(([l,n])=>'<div><strong>'+n+'</strong><span>'+l+'</span></div>').join('')+'</div>';
  const chips = '<div class="dash-filters" role="tablist">'+[['all','All'],['completed','Ready'],['active','In progress'],['draft','Drafts'],['failed','Failed']].map(([k,l])=>'<button type="button" role="tab" aria-selected="'+(k===filter)+'" data-filter="'+k+'">'+l+' <small>'+count(k)+'</small></button>').join('')+'<button type="button" id="refresh" class="dash-refresh" title="Refresh">↻ Refresh</button></div>';
  const card = a => { const [label,tone]=STATUS[a.status]||[a.status,'idle']; const action=a.status==='completed'?'View feedback':a.status==='draft'?'Continue setup':a.status==='failed'?'See error':'View progress';
    return '<article class="dash-card"><a class="dash-thumb" href="/analysis/'+e(a.id)+'" aria-label="Open '+e(a.campaign.product)+'">'+(a.hasImage?'<img loading="lazy" alt="" src="'+e(a.imageUrl)+'">'+'<span class="media-pill">'+e(mediaLabel(a))+'</span>':'<span class="dash-noimg">No ad uploaded yet</span>')+'</a>'
    +'<div class="dash-body"><div class="dash-meta"><span class="status '+tone+'">'+e(label)+'</span><time datetime="'+e(a.updatedAt)+'">'+e(ago(a.updatedAt))+'</time></div><h3><a href="/analysis/'+e(a.id)+'">'+e(a.campaign.product)+'</a></h3><p>'+e(a.campaign.brand)+' · '+e(a.campaign.targetAudience)+'</p>'
    +(['running','queued'].includes(a.status)?'<div class="dash-progress" aria-label="'+a.completedPersonas+' of 5 audience views done"><i style="width:'+Math.max(6,a.completedPersonas/5*100)+'%"></i></div>':'')
    +'<div class="dash-actions"><a href="/analysis/'+e(a.id)+'">'+action+' →</a>'+rerunButton(a,'ghost')+'</div></div></article>'; };
  const grid = shown.length ? '<div class="dash-grid">'+shown.map(card).join('')+'</div>' : '<p class="section-note">Nothing in this view.</p>';
  const pager = '<nav class="pagination">' + (offset ? '<a href="/dashboard?offset=' + Math.max(0,offset-20) + '">← Newer</a>' : '') + (items.length === 20 ? '<a href="/dashboard?offset=' + (offset+20) + '">Older →</a>' : '') + '</nav>';
  return hero + stats + chips + grid + pager;
}
let dashFilter = 'all';
async function dashboard(token) {
  const offset = Math.max(0, Number(new URLSearchParams(location.search).get('offset')) || 0);
  const data = await request('/analyses?limit=20&offset=' + offset);
  if (token !== generation) return;
  const paint = () => {
    app.innerHTML = shell('<div class="dash">'+dashboardView(data.items, {offset, filter:dashFilter})+'</div>');
    document.querySelector('#refresh')?.addEventListener('click', render);
    document.querySelectorAll('[data-filter]').forEach(b => b.onclick = () => { dashFilter = b.dataset.filter; paint(); });
    bindReruns();
  };
  paint();
  // Keep in-progress cards live without a manual refresh.
  if (data.items.some(a => ['running','queued'].includes(a.status))) timer = setTimeout(() => { if (token === generation && location.pathname === '/dashboard') render(); }, 5000);
}

function newAnalysis() {
  app.innerHTML=shell('<p class="eyebrow">Step 1 of 2</p><h1>New ad review</h1><p>Tell us about the campaign so the audience profiles judge the ad against the right goal. Next you’ll upload the image or video.</p><form class="panel" id="create"><div class="form-grid">' + fields.map(([key,label,max]) => '<label>' + label + '<input name="' + key + '" required maxlength="' + max + '"></label>').join('') + '</div><label>Product description (optional)<textarea name="productDescription" maxlength="4000"></textarea></label><label>Product URL (optional)<input name="productUrl" type="url"></label><button type="submit">Continue to upload</button><div id="feedback" aria-live="polite"></div></form>');
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
  const [label,tone]=STATUS[a.status]||[a.status,'idle'];
  app.innerHTML=shell('<p class="eyebrow">'+e(a.campaign.brand)+'</p><h1>'+e(a.campaign.product)+'</h1><section class="panel analysis-context"><div role="status"><span class="status '+tone+'">'+e(label)+'</span> '+(a.hasImage?'<span class="media-pill inline">'+e(mediaLabel(a))+'</span>':'')+'</div><p>'+e(a.campaign.objective)+'</p>'+(a.error?error(a.error):'')+(a.hasImage?'<img class="creative" alt="'+(a.creative?.kind==='video'?'Storyboard of sampled video frames':'Saved ad creative')+'" src="/api'+base+'/image">':'')+'</section><div id="detail-body"></div>');
  const body=document.querySelector('#detail-body');
  if (rerunButton(a)) { body.insertAdjacentHTML('beforebegin','<section class="panel rerun-strip">'+rerunButton(a)+'<p>Runs a fresh review with the same campaign and ad. Your previous report is kept.</p></section>'); bindReruns(); }
  if(a.status==='completed') {body.innerHTML=loading('Loading feedback…'); const r=await request(base+'/report'); if(token===generation)body.innerHTML=reportView(r);return;}
  if(a.status==='running'||a.status==='queued') {
    body.innerHTML='<section class="panel" role="status"><h2>Reviewing your ad</h2>'+progressSteps(a)+'<p class="section-note">Updates every few seconds. You can leave this page; results are saved.</p></section>';
    timer=setTimeout(()=>{if(token===generation)detail(id,token).catch(err=>{body.innerHTML=error(err)+'<button id="poll-retry">Reconnect</button>';document.querySelector('#poll-retry').onclick=render;});},2500);return;
  }
  body.innerHTML='<form class="panel" id="uploads"><p class="eyebrow">Step 2 of 2</p><h2>Upload your ad</h2><label class="dropzone"><input type="file" name="creative" accept="'+[...IMAGE_TYPES,...VIDEO_TYPES].join(',')+'" '+(a.hasImage?'':'required')+'><b>Choose an image or video</b><span>PNG, JPEG or WebP up to 4 MiB · MP4, WebM or MOV up to 10 minutes</span></label><div id="upload-preview"></div><p class="section-note">Videos are turned into a 9-frame storyboard in your browser (the opening seconds are sampled closely); only the storyboard is uploaded. Sound is not analysed. Replacing the ad resets partial results.</p><button type="submit">'+(a.hasImage?'Replace ad':'Upload ad')+'</button><div id="upload-feedback" aria-live="polite"></div></form><section class="panel"><button id="start" '+(!a.hasImage?'disabled':'')+'>'+(a.status==='failed'?'Retry review':'Start review')+'</button><p>Customer opinions about the category are collected automatically from the web and YouTube; coverage gaps are shown in the report.</p><div id="start-feedback" aria-live="polite"></div></section>';
  const form=document.querySelector('#uploads'), input=form.elements.creative, preview=document.querySelector('#upload-preview');
  let prepared=null;
  input.onchange=async()=>{
    prepared=null; preview.innerHTML=''; const file=input.files[0]; if(!file) return;
    const feedback=form.querySelector('#upload-feedback'); feedback.innerHTML='';
    try {
      if (VIDEO_TYPES.includes(file.type) || /\.(mp4|webm|mov|m4v)$/i.test(file.name)) {
        preview.innerHTML=loading('Sampling video frames…');
        const result=await videoToStoryboard(file,(i,n)=>{preview.innerHTML=loading('Sampling video frames… '+(i+1)+'/'+n);});
        prepared={kind:'video',...result};
        preview.innerHTML='<figure class="storyboard-preview"><img alt="Storyboard preview" src="'+URL.createObjectURL(result.blob)+'"><figcaption>'+result.times.length+' frames from a '+result.duration+'s video</figcaption></figure>';
      } else {
        if (!IMAGE_TYPES.includes(file.type)) throw new Error('Use a PNG, JPEG or WebP image, or an MP4, WebM or MOV video.');
        if (file.size>4*1024*1024) throw new Error('Images must be 4 MiB or smaller.');
        prepared={kind:'image',file};
        preview.innerHTML='<figure class="storyboard-preview"><img alt="Ad preview" src="'+URL.createObjectURL(file)+'"></figure>';
      }
    } catch(err) { preview.innerHTML=''; input.value=''; feedback.innerHTML=error(err); }
  };
  form.onsubmit=async event=>{
    event.preventDefault();const button=form.querySelector('button'), feedback=form.querySelector('#upload-feedback'), start=document.querySelector('#start');
    if(!prepared){feedback.innerHTML=error(new Error('Choose an image or video first.'));return;}
    button.disabled=true;start.disabled=true;feedback.innerHTML=loading('Uploading…');
    try{ if(prepared.kind==='video') await uploadVideo(id,prepared.blob,prepared.duration,prepared.times); else await upload(id,'image',prepared.file); await render(); }
    catch(err){feedback.innerHTML=error(err);button.disabled=false;start.disabled=!a.hasImage;}
  };
  document.querySelector('#start').onclick=async event=>{
    event.currentTarget.disabled=true;form.querySelector('button').disabled=true;
    const feedback=document.querySelector('#start-feedback');feedback.innerHTML=loading('Queueing review…');
    try{await request(base+'/start',{method:'POST'});await render();}catch(err){feedback.innerHTML=error(err);document.querySelector('#start').disabled=false;form.querySelector('button').disabled=false;}
  };
}
if (app) render();
