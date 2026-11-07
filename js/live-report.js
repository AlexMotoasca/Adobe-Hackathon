import {escape as e} from './live-api.js';
const short = (value, limit=180) => { const s=String(value || '').trim(); return s.length>limit ? s.slice(0,limit).replace(/\s+\S*$/,'')+'…' : s; };
const list = values => (values || []).length ? '<ul>'+values.map(v=>'<li>'+e(v)+'</li>').join('')+'</ul>' : '';
const link = value => { try {const u=new URL(value);return ['https:','http:'].includes(u.protocol)?'<a href="'+e(u.href)+'" target="_blank" rel="noopener noreferrer">Open source ↗</a>':'';}catch{return '';} };
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
export function reportView(r) {
  const m=reportMetrics(r), sources=r.sources || [], personas=r.personas || [], warnings=r.research?.warnings || [];
  const refs=ids => [...new Set(ids || [])].map(id=>{const i=sources.findIndex(s=>s.id===id);return '<a class="source-ref" href="#source-'+e(id)+'">'+(i<0?'Source':'['+(i+1)+']')+'</a>';}).join('');
  const section=(id,title,lead,body)=>'<section id="'+id+'" class="panel report-section"><h2>'+title+'</h2>'+(lead?'<p class="section-note">'+lead+'</p>':'')+body+'</section>';
  const assessmentFor=id=>(r.assessments || []).find(a=>a.findingId===id);

  // 1. Verdict + one evidence meter
  const backed=m.classifications.filter(c=>['supported','partially_supported','contradicted'].includes(c.key)).reduce((n,c)=>n+c.count,0);
  const total=m.classifications.reduce((n,c)=>n+c.count,0);
  const meter=total?'<div class="evidence-meter" role="img" aria-label="'+backed+' of '+total+' concerns checked against customer evidence">'+ORDER.map(key=>{const c=m.classifications.find(x=>x.key===key);return c.count?'<i class="seg '+key+'" style="flex:'+c.count+'" title="'+LABELS[key]+': '+c.count+'"></i>':'';}).join('')+'</div><div class="meter-legend">'+ORDER.map(key=>{const c=m.classifications.find(x=>x.key===key);return c.count?'<span><i class="dot '+key+'"></i>'+LABELS[key]+' '+c.count+'</span>':'';}).join('')+'</div>':'';
  const hero='<header class="report-hero"><div class="hero-top"><p class="eyebrow">'+e(r.campaign?.category || 'Advertisement')+' · '+(r.creative?.kind==='video'?'Video ad'+(r.creative.durationSeconds?' ('+Math.round(r.creative.durationSeconds)+'s)':''):'Image ad')+' · AI pre-test</p></div><h2 class="report-verdict">'+e(short(r.synthesis.executiveSummary,260))+'</h2>'
    +'<div class="hero-facts"><span><b>'+m.actions+'</b> changes to make</span><span><b>'+personas.length+'</b> audience views</span><span><b>'+m.sourceCount+'</b> sources read</span><span><b>'+backed+'/'+total+'</b> concerns evidence-checked</span></div>'+meter+'</header>';
  const coverage=!sources.length?'<div class="report-notice"><b>No customer evidence used</b><p>Ad observations and AI hypotheses only. No customer preference or sales impact is established.</p></div>':warnings.length?'<div class="report-notice"><b>Partial research coverage</b> — '+warnings.length+' collection notice'+(warnings.length>1?'s':'')+'. <a href="#research-details">See details</a></div>':'';

  // 2. What to change
  const recs=r.synthesis.recommendations.slice(0,3);
  const actions=section('ad-review','What to improve','The changes most likely to help this ad market the product, highest impact first.',recs.length?'<ol class="action-list">'+recs.map(a=>'<li class="action-item"><div class="action-head"><h3>'+e(short(a.problem,140))+'</h3><span class="priority '+e(a.priority)+'">'+e(a.priority)+'</span></div><p class="action-do"><b>Do this:</b> '+e(short(a.proposedChange,220))+'</p>'+(a.exampleCopy?'<p class="action-copy"><b>Try:</b> “'+e(a.exampleCopy)+'”</p>':'')+'<details><summary>Why, and how to test it</summary><p>'+e(a.rationale)+'</p><p><b>Test:</b> '+e(a.testingHypothesis)+'</p>'+(a.evidenceIds?.length?'<p class="refs">Sources '+refs(a.evidenceIds)+'</p>':'<p class="refs">Creative hypothesis — no customer source cited.</p>')+'</details></li>').join('')+'</ol>':'<p>No priority changes were returned.</p>');

  // 3. What works
  const strengths=r.synthesis.strengths || [];
  const works=strengths.length?section('strengths','What works','Keep these: they already land with your audience.',list(strengths)):'';

  // 4. Audience reactions: one row per persona
  const tag=o=>{const a=assessmentFor(o.id);return a?'<span class="tag '+e(a.classification)+'">'+LABELS[a.classification]+'</span>':'';};
  const perspectives=section('perspectives','How each audience psychology reacts','Five simulated viewers from your audience, each with a different buying psychology. Open one for what works on them, what loses them, and their ideas.','<div class="persona-list">'+personas.map(p=>'<details class="persona-row"><summary><span class="persona-name">'+e(names[p.persona] || p.persona)+'<small>'+e(focus[p.persona] || '')+'</small></span><span class="persona-quote">'+e(short(p.firstImpression,150))+'</span><span class="persona-count">'+p.objections.length+' concern'+(p.objections.length===1?'':'s')+'</span></summary><p class="persona-sub">What loses me</p><ul class="concerns">'+p.objections.map(o=>'<li>'+e(o.statement)+' '+tag(o)+' '+refs(o.evidenceIds)+'</li>').join('')+'</ul>'+(p.strengths?.length?'<p class="persona-likes"><b>Works on me:</b> '+e(p.strengths.join(' · '))+'</p>':'')+(p.recommendations?.length?'<div class="persona-ideas"><b>What would win me over</b>'+list(p.recommendations)+'</div>':'')+'</details>').join('')+'</div>');

  // 5. Customer context
  const themes=[...(r.consumerInsights?.themes || [])].sort((a,b)=>b.frequency-a.frequency).slice(0,5), maxTheme=Math.max(1,...themes.map(t=>t.frequency));
  const themeRows=themes.map(t=>'<div class="theme-row"><div><b>'+e(short(t.theme,90))+'</b><span class="sent '+e(t.sentiment)+'">'+e(t.sentiment)+'</span></div><div class="bar-track" aria-hidden="true"><i class="bar-fill" style="width:'+t.frequency/maxTheme*100+'%"></i></div><span class="theme-meta">'+t.frequency+' source'+(t.frequency===1?'':'s')+' '+refs(t.reviewIds)+'</span></div>').join('');
  const criteria=(r.research?.criteria || []).slice(0,4);
  const quotes=sources.filter(s=>s.source.startsWith('YouTube audience comment:')).slice(0,2);
  const customers=section('customer-experience','Customer experience','What people say about '+e(r.research?.plan.category || r.campaign?.category || 'the category')+'. Context for your message — not a review of your product.',
    '<div class="report-grid"><div><h3>Recurring themes</h3>'+(themeRows || '<p>No sourced themes available.</p>')+'</div><div>'+(criteria.length?'<h3>What buyers weigh</h3><ul class="criteria">'+criteria.map(c=>'<li><b>'+e(c.criterion)+'</b> — '+e(short(c.observation,160))+' '+refs(c.evidenceIds)+'</li>').join('')+'</ul>':'')
    +(quotes.length?'<h3>In their words</h3>'+quotes.map(s=>'<blockquote><p>'+e(short(s.text,200))+'</p><footer>Audience comment '+refs([s.id])+'</footer></blockquote>').join(''):'')+'</div></div>');

  // 6. Everything else, collapsed
  const audit=section('research-details','Details & sources',sources.length+' sources retained. Audience comments are not verified purchases; web excerpts may be editorial.',
    '<details><summary>Category research & coverage</summary>'+(r.research?'<p>'+e(r.research.plan.category)+' · '+e(new Date(r.research.fetchedAt).toLocaleString())+'</p>'+list(r.research.providers.map(p=>p.name+': '+p.status.replaceAll('_',' ')+' · '+p.count+' collected before filtering'))+list(warnings)+'<p><b>Searches:</b></p>'+list(r.research.plan.queries):'<p>This older report did not run category research.</p>')+'</details>'
    +'<details><summary>What the AI saw in the ad</summary>'+(r.ad.visibleText?'<p>'+e(r.ad.visibleText)+'</p>':'')+list(r.ad.observedElements)+'</details>'
    +'<details><summary>All evidence checks</summary>'+((r.assessments || []).map(a=>'<p><span class="tag '+e(a.classification)+'">'+e(LABELS[a.classification])+'</span> '+e(a.explanation)+' '+refs(a.evidenceIds)+'</p>').join('') || '<p>No evidence checks.</p>')+'</details>'
    +'<details><summary>All source excerpts</summary><div class="source-library">'+sources.map((s,i)=>'<details id="source-'+e(s.id)+'"><summary>['+(i+1)+'] '+e(short(s.source,100))+'</summary><blockquote>'+e(s.text)+'</blockquote><p>'+e(s.relevance.replaceAll('_',' '))+(s.publishedAt?' · Published '+e(s.publishedAt):'')+'</p>'+link(s.sourceUrl)+'</details>').join('')+'</div></details>'
    +'<details><summary>Limitations</summary>'+list([...new Set([...(r.limitations || []),...r.synthesis.limitations])])+'</details>');

  return '<div class="report-dashboard">'+hero+coverage+works+actions+perspectives+customers+audit+'</div>';
}
