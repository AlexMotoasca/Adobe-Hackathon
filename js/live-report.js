import {escape as e} from './live-api.js';
import {translator} from './i18n.js';
const short = (value, limit=180) => { const s=String(value || '').trim(); return s.length>limit ? s.slice(0,limit).replace(/\s+\S*$/,'')+'…' : s; };
const names={skeptic:'The skeptic',impulsive:'The scroller',bargain:'The value seeker',quality:'The aspirational buyer',rational:'The planner'};
const focus={skeptic:'Needs trust & proof',impulsive:'Decides in 3 seconds',bargain:'Weighs value vs. cost',quality:'Buys identity & quality',rational:'Thinks it through'};
const LABELS={supported:'Backed by evidence',partially_supported:'Partly backed',hypothesis:'Untested idea',contradicted:'Contradicted',insufficient_data:'Not enough data'};
const ORDER=['supported','partially_supported','contradicted','hypothesis','insufficient_data'];
export function reportMetrics(r) {
  const sources=r.sources || [], personas=r.personas || [], assessments=r.assessments || [];
  return {
    sourceCount:sources.length,
    findings:personas.reduce((n,p)=>n+p.objections.length,0),
    cited:new Set(personas.flatMap(p=>p.objections.flatMap(o=>o.evidenceIds || []))).size,
    actions:Math.min(3,r.synthesis.recommendations.length),
    classifications:['supported','partially_supported','hypothesis','contradicted','insufficient_data'].map(key=>({key,count:assessments.filter(a=>a.classification===key).length})),
  };
}
// Turns "1.5s", "at 3 s" or "10 sec" in already-escaped text into buttons that seek the report's video.
export function linkTimes(html, duration=Infinity) {
  return html.replace(/\b(\d{1,3}(?:\.\d{1,2})?)\s?(s|sec|seconds)\b/g, (match, t) => Number(t) <= duration + 1 ? '<button type="button" class="ts" data-seek="'+Number(t)+'">'+match+'</button>' : match);
}
// opts.t translates fixed UI labels into the report language (English when omitted).
export function reportView(r, opts={}) {
  const t=opts.t || translator(), T=(s,vars)=>e(t(s,vars));
  const plural=(n,one,many)=>n===1?T(one):T(many,{n});
  const list=values=>(values || []).length?'<ul>'+values.map(v=>'<li>'+T(v)+'</li>').join('')+'</ul>':'';
  const link=value=>{try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?'<a href="'+e(u.href)+'" target="_blank" rel="noopener noreferrer">'+T('Open source ↗')+'</a>':'';}catch{return '';}};
  const isVideo=r.creative?.kind==='video', duration=r.creative?.durationSeconds ?? Infinity;
  // Bracketed fill-in placeholders ("[verified local price]") are translated one by one.
  const brackets=s=>s.replace(/\[([^\]]{1,60})\]/g,(m,inner)=>'['+t(inner)+']');
  const tx=(s,limit)=>{const h=e(brackets(t(limit?short(s,limit):s)));return isVideo?linkTimes(h,duration):h;};
  const m=reportMetrics(r), sources=r.sources || [], personas=r.personas || [], warnings=r.research?.warnings || [];
  const refs=ids => [...new Set(ids || [])].map(id=>{const i=sources.findIndex(s=>s.id===id);return '<a class="source-ref" href="#source-'+e(id)+'">'+(i<0?T('Source'):'['+(i+1)+']')+'</a>';}).join('');
  const section=(id,title,lead,body)=>'<section id="'+id+'" class="panel report-section"><h2>'+title+'</h2>'+(lead?'<p class="section-note">'+lead+'</p>':'')+body+'</section>';
  const assessmentFor=id=>(r.assessments || []).find(a=>a.findingId===id);

  // 1. Verdict + one evidence meter
  const backed=m.classifications.filter(c=>['supported','partially_supported','contradicted'].includes(c.key)).reduce((n,c)=>n+c.count,0);
  const total=m.classifications.reduce((n,c)=>n+c.count,0);
  const meter=total?'<div class="evidence-meter" role="img" aria-label="'+T('{backed} of {total} concerns checked against customer evidence',{backed,total})+'">'+ORDER.map(key=>{const c=m.classifications.find(x=>x.key===key);return c.count?'<i class="seg '+key+'" style="flex:'+c.count+'" title="'+T(LABELS[key])+': '+c.count+'"></i>':'';}).join('')+'</div><div class="meter-legend">'+ORDER.map(key=>{const c=m.classifications.find(x=>x.key===key);return c.count?'<span><i class="dot '+key+'"></i>'+T(LABELS[key])+' '+c.count+'</span>':'';}).join('')+'</div>':'';
  const format=isVideo?T('Video ad')+(r.creative.durationSeconds?' ('+Math.round(r.creative.durationSeconds)+'s)':'')+(r.creative.transcript?.text?' '+T('with speech'):''):T('Image ad');
  const hero='<header class="report-hero"><div class="hero-top"><p class="eyebrow">'+(r.campaign?.category?e(r.campaign.category):T('Advertisement'))+' · '+format+' · '+T('AI pre-test')+'</p></div><h2 class="report-verdict">'+e(short(r.synthesis.executiveSummary,260))+'</h2>'
    +'<div class="hero-facts"><span><b>'+m.actions+'</b> '+T('changes to make')+'</span><span><b>'+personas.length+'</b> '+T('audience views')+'</span><span><b>'+m.sourceCount+'</b> '+T('sources read')+'</span><span><b>'+backed+'/'+total+'</b> '+T('concerns evidence-checked')+'</span></div>'+meter+'</header>';
  const coverage=!sources.length?'<div class="report-notice"><b>'+T('No customer evidence used')+'</b><p>'+T('Ad observations and AI hypotheses only. No customer preference or sales impact is established.')+'</p></div>':warnings.length?'<div class="report-notice"><b>'+T('Partial research coverage')+'</b> — '+plural(warnings.length,'1 collection notice','{n} collection notices')+'. <a href="#research-details">'+T('See details')+'</a></div>':'';

  // Video player: every timestamp in the report seeks it.
  const segments=r.creative?.transcript?.segments || [];
  const moments=(r.creative?.frameTimes || []).map((s,i)=>'<button type="button" class="ts chip" data-seek="'+s+'">'+T('Frame {n}',{n:i+1})+' · '+s.toFixed(1)+'s</button>').join('');
  const script=segments.length?'<div class="script"><b>'+T('What is said')+'</b>'+segments.map(sg=>'<p><button type="button" class="ts" data-seek="'+sg.start+'">'+sg.start.toFixed(1)+'s</button> '+e(sg.text)+'</p>').join('')+'</div>':(r.creative?.transcript?.text?'<div class="script"><b>'+T('What is said')+'</b><p>'+e(r.creative.transcript.text)+'</p></div>':'');
  const player=isVideo&&opts.videoUrl?section('ad-player',T('Your ad'),T('Click any timestamp in this report to jump to that moment.'),'<div class="player-grid"><video class="report-video" controls preload="metadata" playsinline src="'+e(opts.videoUrl)+'"></video><div class="moments"><b>'+T('Frames the AI reviewed')+'</b><div class="chips">'+moments+'</div>'+script+'</div></div>')
    :isVideo&&opts.storyboardUrl?section('ad-player',T('Your ad'),T('The original video was not stored for playback; these are the frames the AI reviewed.'),'<img class="storyboard-full" alt="'+T('Storyboard of sampled video frames')+'" src="'+e(opts.storyboardUrl)+'">'+script):'';

  // 2. What to change
  const recs=r.synthesis.recommendations.slice(0,3);
  const actions=section('ad-review',T('What to improve'),T('The changes most likely to help this ad market the product, highest impact first.'),recs.length?'<ol class="action-list">'+recs.map(a=>'<li class="action-item"><div class="action-head"><h3>'+tx(a.problem,140)+'</h3><span class="priority '+e(a.priority)+'">'+T(a.priority)+'</span></div><p class="action-do"><b>'+T('Do this:')+'</b> '+tx(a.proposedChange,220)+'</p>'+(a.exampleCopy?'<p class="action-copy"><b>'+T('Try:')+'</b> “'+tx(a.exampleCopy)+'”</p>':'')+'<details><summary>'+T('Why, and how to test it')+'</summary><p>'+tx(a.rationale)+'</p><p><b>'+T('Test:')+'</b> '+tx(a.testingHypothesis)+'</p>'+(a.evidenceIds?.length?'<p class="refs">'+T('Sources')+' '+refs(a.evidenceIds)+'</p>':'<p class="refs">'+T('Creative hypothesis — no customer source cited.')+'</p>')+'</details></li>').join('')+'</ol>':'<p>'+T('No priority changes were returned.')+'</p>');

  // 3. What works
  const strengths=r.synthesis.strengths || [];
  const works=strengths.length?section('strengths',T('What works'),T('Keep these: they already land with your audience.'),'<ul>'+strengths.map(x=>'<li>'+tx(x)+'</li>').join('')+'</ul>'):'';

  // 4. Audience reactions: one row per persona
  const tag=o=>{const a=assessmentFor(o.id);return a?'<span class="tag '+e(a.classification)+'">'+T(LABELS[a.classification])+'</span>':'';};
  const perspectives=section('perspectives',T('How each audience psychology reacts'),T('Five simulated viewers from your audience, each with a different buying psychology. Open one for what works on them, what loses them, and their ideas.'),'<div class="persona-list">'+personas.map(p=>'<details class="persona-row"><summary><span class="persona-name">'+T(names[p.persona] || p.persona)+'<small>'+T(focus[p.persona] || '')+'</small></span><span class="persona-quote">'+tx(p.firstImpression,150)+'</span><span class="persona-count">'+plural(p.objections.length,'1 concern','{n} concerns')+'</span></summary><p class="persona-sub">'+T('What loses me')+'</p><ul class="concerns">'+p.objections.map(o=>'<li>'+tx(o.statement)+' '+tag(o)+' '+refs(o.evidenceIds)+'</li>').join('')+'</ul>'+(p.strengths?.length?'<p class="persona-likes"><b>'+T('Works on me:')+'</b> '+e(p.strengths.join(' · '))+'</p>':'')+(p.recommendations?.length?'<div class="persona-ideas"><b>'+T('What would win me over')+'</b><ul>'+p.recommendations.map(x=>'<li>'+tx(x)+'</li>').join('')+'</ul></div>':'')+'</details>').join('')+'</div>');

  // 5. Customer context
  const themes=[...(r.consumerInsights?.themes || [])].sort((a,b)=>b.frequency-a.frequency).slice(0,5), maxTheme=Math.max(1,...themes.map(x=>x.frequency));
  const themeRows=themes.map(x=>'<div class="theme-row"><div><b>'+e(short(x.theme,90))+'</b><span class="sent '+e(x.sentiment)+'">'+T(x.sentiment)+'</span></div><div class="bar-track" aria-hidden="true"><i class="bar-fill" style="width:'+x.frequency/maxTheme*100+'%"></i></div><span class="theme-meta">'+plural(x.frequency,'1 source','{n} sources')+' '+refs(x.reviewIds)+'</span></div>').join('');
  const criteria=(r.research?.criteria || []).slice(0,4);
  const quotes=sources.filter(s=>s.source.startsWith('YouTube audience comment:')).slice(0,2);
  const category=r.research?.plan.category || r.campaign?.category || t('the category');
  const customers=section('customer-experience',T('Customer experience'),T('What people say about {category}. Context for your message — not a review of your product.',{category}),
    '<div class="report-grid"><div><h3>'+T('Recurring themes')+'</h3>'+(themeRows || '<p>'+T('No sourced themes available.')+'</p>')+'</div><div>'+(criteria.length?'<h3>'+T('What buyers weigh')+'</h3><ul class="criteria">'+criteria.map(c=>'<li><b>'+e(c.criterion)+'</b> — '+e(short(c.observation,160))+' '+refs(c.evidenceIds)+'</li>').join('')+'</ul>':'')
    +(quotes.length?'<h3>'+T('In their words')+'</h3>'+quotes.map(s=>'<blockquote><p>'+e(short(s.text,200))+'</p><footer>'+T('Audience comment')+' '+refs([s.id])+'</footer></blockquote>').join(''):'')+'</div></div>');

  // 6. Everything else, collapsed
  const tr=r.creative?.transcript;
  const audit=section('research-details',T('Details & sources'),T('{n} sources retained. Audience comments are not verified purchases; web excerpts may be editorial.',{n:sources.length}),
    '<details><summary>'+T('Category research & coverage')+'</summary>'+(r.research?'<p>'+e(r.research.plan.category)+' · '+e(new Date(r.research.fetchedAt).toLocaleString())+'</p>'+'<ul>'+r.research.providers.map(p=>'<li>'+e(p.name+': '+p.status.replaceAll('_',' '))+' · '+T('{n} collected before filtering',{n:p.count})+'</li>').join('')+'</ul>'+list(warnings)+'<p><b>'+T('Searches:')+'</b></p>'+'<ul>'+r.research.plan.queries.map(q=>'<li>'+e(q)+'</li>').join('')+'</ul>':'<p>'+T('This older report did not run category research.')+'</p>')+'</details>'
    +'<details><summary>'+T(tr?.text?'What the AI saw and heard in the ad':'What the AI saw in the ad')+'</summary>'+(r.ad.visibleText?'<p><b>'+T('On screen:')+'</b> '+e(r.ad.visibleText)+'</p>':'')+(r.ad.spokenMessage?'<p><b>'+T('What is said')+':</b> '+e(r.ad.spokenMessage)+'</p>':'')+'<ul>'+(r.ad.observedElements || []).map(x=>'<li>'+e(x)+'</li>').join('')+'</ul>'+(tr?.text?'<p><b>'+T('Transcript')+(tr.checked?' ('+T('grammar-checked')+')':'')+':</b></p><blockquote>'+e(tr.text)+'</blockquote>'+(tr.rawText?'<p class="refs">'+T('Original automatic transcript:')+' '+e(tr.rawText)+'</p>':''):'')+'</details>'
    +'<details><summary>'+T('All evidence checks')+'</summary>'+((r.assessments || []).map(a=>'<p><span class="tag '+e(a.classification)+'">'+T(LABELS[a.classification])+'</span> '+e(a.explanation)+' '+refs(a.evidenceIds)+'</p>').join('') || '<p>'+T('No evidence checks.')+'</p>')+'</details>'
    +'<details><summary>'+T('All source excerpts')+'</summary><div class="source-library">'+sources.map((s,i)=>'<details id="source-'+e(s.id)+'"><summary>['+(i+1)+'] '+e(short(s.source,100))+'</summary><blockquote>'+e(s.text)+'</blockquote><p>'+T(s.relevance.replaceAll('_',' '))+(s.publishedAt?' · '+T('Published {date}',{date:s.publishedAt}):'')+'</p>'+link(s.sourceUrl)+'</details>').join('')+'</div></details>'
    +'<details><summary>'+T('Limitations')+'</summary>'+list([...new Set([...(r.limitations || []),...r.synthesis.limitations])])+'</details>');

  return '<div class="report-dashboard">'+hero+player+coverage+works+actions+perspectives+customers+audit+'</div>';
}
