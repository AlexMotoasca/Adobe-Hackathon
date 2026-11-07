// Public landing page and sign-in page (Ventriloc editorial style).
import {escape as e} from './live-api.js';

const GOOGLE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.96S8.78 6.26 12 6.26c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.68 3.7 14.55 2.75 12 2.75 6.9 2.75 2.75 6.9 2.75 12s4.15 9.25 9.25 9.25c5.34 0 8.88-3.75 8.88-9.04 0-.6-.07-1.06-.15-1.51z"/></svg>';
export const AUTH_ERRORS = {
  google_not_configured: 'Google sign-in is not set up on this server yet. Add <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> to <code>backend/.env.local</code> and restart the backend.',
  cancelled: 'Sign-in was cancelled. Try again when you are ready.',
  expired: 'The sign-in attempt expired. Please try again.',
  state_mismatch: 'The sign-in attempt could not be verified. Please try again.',
  token_exchange: 'Google did not complete the sign-in. Check the OAuth client settings and try again.',
  unverified: 'Your Google account email could not be verified.',
};
export const googleHref = (next = '/dashboard') => '/api/auth/google?next=' + encodeURIComponent(next);
export const brand = (href = '/') => '<a class="brand" href="' + href + '"><img src="/assets/logo.svg" alt="" width="40" height="36">MindMarket</a>';
const signIn = (label = 'Sign in with Google', cls = 'btn', next) => '<a class="' + cls + '" href="' + googleHref(next) + '" data-full>' + GOOGLE_ICON + e(label) + '</a>';
const fmt = n => new Intl.NumberFormat('en').format(n);

function header(user) {
  return '<header class="site-header"><div class="wrap">' + brand('/') +
    '<nav class="nav-pill" aria-label="Sections"><a href="#how">How it works</a><a href="#audiences">Audiences</a><a href="#features">Features</a></nav>' +
    '<div class="header-actions">' + (user ? '<a class="btn" href="/dashboard">Open dashboard</a>' : signIn('Sign in', 'btn')) + '</div></div></header>';
}
function footer() {
  return '<footer class="site-footer"><div class="wrap">' + brand('/') + '<p>AI pre-testing for advertising. Personas are simulations, not real interviews.</p><p>© ' + new Date().getFullYear() + ' MindMarket</p></div></footer>';
}
// Illustrative product preview: clearly labelled as an example, not live data.
function cluster() {
  const ring = '<svg class="ring" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="32" fill="none" stroke="#efefef" stroke-width="7"/><circle cx="40" cy="40" r="32" fill="none" stroke="#ff682c" stroke-width="7" stroke-dasharray="120 201" transform="rotate(-90 40 40)"/><circle cx="40" cy="40" r="22" fill="none" stroke="#816729" stroke-width="2" stroke-dasharray="60 139" transform="rotate(-90 40 40)"/></svg>';
  return '<div class="cluster" aria-label="Example report preview">'
    + '<div class="data-card card-verdict"><h4>Verdict</h4><p class="big">The opening hook stops the scroll, but the product appears too late and the claim has no proof.</p><div class="mini-meter"><i style="flex:3;background:#202020"></i><i style="flex:4;background:#816729"></i><i style="flex:2;background:#ff682c"></i><i style="flex:5;background:#e8e8e8"></i></div></div>'
    + '<div class="data-card card-personas"><h4>How each audience reacts</h4><div class="mini-bars">'
    + [['The skeptic', 40], ['The scroller', 85], ['The value seeker', 55], ['The aspirational', 70], ['The planner', 45]].map(([n, w]) => '<div>' + n + '<span><i style="width:' + w + '%"></i></span></div>').join('') + '</div></div>'
    + '<div class="data-card card-ring">' + ring + '<div><h4>To improve</h4><p class="big">3 focused changes</p></div></div>'
    + '<span class="example-tag">Example report</span></div>';
}

export function landingView({users = null, googleConfigured = true, user = null, authError = ''} = {}) {
  const count = typeof users === 'number' ? users : null;
  const proof = count === null ? '' : '<div class="social-proof"><strong>' + fmt(count) + '</strong><span class="caption">' + (count === 1 ? 'marketer has signed up' : 'marketers have signed up') + '</span></div>';
  const error = authError && AUTH_ERRORS[authError] ? '<p class="auth-error" role="alert">' + AUTH_ERRORS[authError] + '</p>' : (!googleConfigured && !user ? '<p class="auth-error">' + AUTH_ERRORS.google_not_configured + '</p>' : '');
  const primary = user ? '<a class="btn" href="/dashboard">Open your dashboard</a>' : signIn('Sign in with Google');
  return header(user) + '<main class="landing">'
    + '<section class="wrap hero"><div><p class="eyebrow">AI ad pre-testing</p><h1>Know how your ad lands <em>before</em> it runs.</h1>'
    + '<p class="lead">Upload an image or video ad. Five audience psychologies tell you what works, what doesn’t, and how to market your product more accurately.</p>'
    + error + '<div class="cta-row">' + primary + '<a class="btn ghost" href="#how">See how it works</a></div>' + proof + '</div>' + cluster() + '</section>'
    + '<div class="wrap"><div class="stat-strip">'
    + '<div><strong>' + (count === null ? '—' : fmt(count)) + '</strong><span>Marketers signed up</span></div>'
    + '<div><strong>5</strong><span>Audience psychologies per review</span></div>'
    + '<div><strong>42</strong><span>Report languages</span></div>'
    + '<div><strong>Video</strong><span>And image ads, with speech transcription</span></div></div></div>'
    + '<section id="how" class="band-ash"><div class="wrap"><div class="section-head"><p class="eyebrow">How it works</p><h2>From upload to clear next steps.</h2><p>No surveys to run and no panels to recruit. Get a structured read on your creative before you spend on media.</p></div><div class="steps">'
    + [['Describe the campaign', 'Brand, product, audience, objective, market and the language you want your report in.'],
       ['Upload your ad', 'An image, or a video up to 10 minutes. Videos are sampled frame by frame and their speech is transcribed.'],
       ['Act on the feedback', 'What works, what to improve and example copy, grounded in what real buyers say about your category.']]
      .map(([h, p], i) => '<article class="feature-card"><span class="num">0' + (i + 1) + '</span><h3>' + h + '</h3><p>' + p + '</p></article>').join('') + '</div></div></section>'
    + '<section id="audiences"><div class="wrap"><div class="section-head"><p class="eyebrow">Five buying psychologies</p><h2>One ad, five honest reactions.</h2><p>Each simulated viewer belongs to your target audience but buys for a different reason, so you see what persuades and what loses people.</p></div><div class="psych-grid">'
    + [['The skeptic', 'Needs trust & proof', 'Wants specific claims, social proof and risk reversal.'],
       ['The scroller', 'Decides in 3 seconds', 'Responds to a strong hook, emotion and an obvious next step.'],
       ['The value seeker', 'Weighs value vs. cost', 'Looks for offer framing, price anchoring and reasons it is worth it.'],
       ['The aspirational buyer', 'Buys identity & quality', 'Reads craftsmanship, brand personality and what owning it says.'],
       ['The planner', 'Thinks it through', 'Needs a clear benefit, who it is for and how it fits their life.']]
      .map(([h, s, p]) => '<article class="psych"><h3>' + h + '</h3><small>' + s + '</small><p>' + p + '</p></article>').join('') + '</div></div></section>'
    + '<section id="features" class="band-ash"><div class="wrap"><div class="section-head"><p class="eyebrow">Built for real creative work</p><h2>Feedback you can act on today.</h2></div><div class="features">'
    + [['Video, frame by frame', 'Watch your ad inside the report. Every timestamp in the feedback jumps the player to that moment.'],
       ['Grounded in real opinions', 'Category research collects web reviews and audience comments, and every concern shows how well the evidence backs it.'],
       ['Speech transcription', 'Voiceover and dialogue are transcribed and grammar-checked, so the script is reviewed alongside the visuals.'],
       ['Reports in your language', 'Choose from 42 languages. Feedback, labels and suggestions are written in the language you select.']]
      .map(([h, p]) => '<article class="feature-card"><h3>' + h + '</h3><p>' + p + '</p></article>').join('') + '</div></div></section>'
    + '<section class="band-ivory"><div class="wrap cta-band"><h2>Test your next ad before the budget goes live.</h2>' + primary + '</div></section>'
    + '</main>' + footer();
}

export function loginView({next = '/dashboard', googleConfigured = true, authError = ''} = {}) {
  const error = authError && AUTH_ERRORS[authError] ? '<p class="auth-error" role="alert">' + AUTH_ERRORS[authError] + '</p>' : (!googleConfigured ? '<p class="auth-error">' + AUTH_ERRORS.google_not_configured + '</p>' : '');
  return header(null) + '<main class="landing"><section class="wrap"><div class="panel login-card"><img src="/assets/logo.svg" alt="MindMarket"><p class="eyebrow">Welcome back</p><h2>Sign in to MindMarket</h2><p>Use your Google account to see your ad reviews and start new ones.</p>'
    + error + '<div class="cta-row" style="margin-top:28px">' + signIn('Continue with Google', 'btn', next) + '</div></div></section></main>' + footer();
}
