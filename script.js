(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ===== TEXTOS — edite aqui ===== */
const KEYWORD = 'olhar';
const HINT = 'A palavra tem cinco letras e começa com O. Pense em algo que pode dizer muito sem pronunciar nada.';
const ERROR = 'Ainda não é essa palavra. Pense em algo que pode dizer muito sem pronunciar uma única palavra.';
const FRAG = [
  { w: 'CANSAÇO', x: 22, y: 30, t: 'Naquele dia, eu estava exausto e estressado. Minha mente parecia uma tempestade que não queria passar.' },
  { w: 'ENCONTRO', x: 70, y: 22, t: 'Foi no dia em que conheci você que algo inesperado aconteceu.' },
  { w: 'SILÊNCIO', x: 46, y: 68, t: 'Sem precisar resolver meus problemas, seu olhar me trouxe uma tranquilidade que eu não esperava.' }
];
const L3 = [
  'Eu estava exausto. Estressado. Com a cabeça cheia.',
  'Então conheci você.',
  'E houve algo no seu olhar que me trouxe uma tranquilidade que eu não esperava encontrar naquele momento.'
];
const L4 = [
  'Algumas lembranças permanecem por causa do que aconteceu. Outras, pelo que fizeram a gente sentir.',
  'Talvez você não saiba o que aquele instante significou para mim.',
  'Eu admiro seu olhar, mas o que ficou comigo foi muito mais do que a sua beleza.',
  'Naquele dia, seu olhar pareceu alcançar um lugar dentro de mim que as palavras não alcançavam.',
  'Você me acalmou. E, depois daquele encontro, consegui dormir em paz.',
  'Por isso, este primeiro capítulo tem o seu olhar como protagonista.'
];
const L5 = [
  'O primeiro segredo foi revelado.',
  'Mas um olhar não é a única coisa que pode ficar guardada na memória.',
  'No próximo capítulo, outra descoberta espera por você.'
];

/* ===== ESTADO (salvo só neste navegador) ===== */
const KEY = 'cosmos-cap01';
const def = { scene: 1, found: [], s3: false, s4: false, s5: false, fx: true };
let S;
try { S = { ...def, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) { S = { ...def }; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
/* progresso salvo pode estar corrompido ou incompleto: normaliza para nunca travar a navegação */
S.found = Array.isArray(S.found) ? [...new Set(S.found.filter(i => i === 0 || i === 1 || i === 2))] : [];
S.scene = Number.isInteger(S.scene) && S.scene >= 1 && S.scene <= 5 ? S.scene : 1;
if (S.scene >= 3 && S.found.length < 3) S.scene = 2;

/* ===== CÉU (canvas) ===== */
const cv = $('#sky'), cx = cv.getContext('2d');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches || Math.min(innerWidth, innerHeight) < 600;
let fx = reduce ? false : S.fx !== false;
let W = 0, H = 0, lastW = 0, stars = [], dens = 0.35, cd = 0.35, raf = 0, lastT = 0;
const DENS = { 1: .35, 2: 1, 3: .28, 4: .75, 5: .85 };

function resize() {
  const d = Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2);
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W * d); cv.height = Math.round(H * d);
  cx.setTransform(d, 0, 0, d, 0, 0);
  if (W !== lastW || !stars.length) {            // só recria se a LARGURA mudou (a barra de endereço muda só a altura)
    lastW = W;
    const gh = Math.max(H, Math.min((window.screen && screen.height) || H, 1000));
    const n = Math.max(coarse ? 45 : 70, Math.min(coarse ? 85 : 170, Math.round(W * gh / (coarse ? 11000 : 8000))));
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * gh, z: Math.random(),
      r: .4 + Math.random() * 1.1, ph: Math.random() * 6.28, sp: .6 + Math.random() * 1.6
    }));
  }
  draw(performance.now());
}
function draw(t) {
  cx.clearRect(0, 0, W, H);
  const n = Math.round(stars.length * cd);
  for (let i = 0; i < n; i++) {
    const s = stars[i];
    const x = fx ? (s.x + t * 0.004 * (0.2 + s.z)) % W : s.x;
    const a = fx ? .3 + .7 * (.5 + .5 * Math.sin(t / 1000 * s.sp + s.ph)) : .7;
    cx.fillStyle = s.z > .8 ? 'rgba(215,228,255,' + a + ')' : 'rgba(170,190,235,' + (a * .8) + ')';
    cx.beginPath(); cx.arc(x, s.y, s.r * (.6 + s.z * .6), 0, 6.283); cx.fill();
    if (s.z > .88) { cx.fillStyle = 'rgba(150,175,255,' + (a * .12) + ')'; cx.beginPath(); cx.arc(x, s.y, s.r * 4, 0, 6.283); cx.fill(); }
  }
}
function loop(t) {
  if (!fx || document.hidden) { raf = 0; return; }
  raf = requestAnimationFrame(loop);
  if (coarse && t - lastT < 33) return;          // ~30 quadros/s no celular: economiza bateria
  lastT = t;
  cd += (dens - cd) * .04;
  draw(t);
}
function applyFx() {
  document.body.classList.toggle('nofx', !fx);
  const b = $('#fxBtn');
  b.setAttribute('aria-pressed', String(fx));
  b.setAttribute('aria-label', 'Efeitos de movimento: ' + (fx ? 'ligados' : 'pausados'));
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  if (fx) raf = requestAnimationFrame(loop); else { cd = dens; draw(performance.now()); }
}
$('#fxBtn').onclick = () => { fx = !fx; S.fx = fx; save(); applyFx(); };
document.addEventListener('visibilitychange', () => { if (!document.hidden && fx && !raf) raf = requestAnimationFrame(loop); });
let rt = 0;
function onResize() {
  clearTimeout(rt);
  rt = setTimeout(() => { resize(); $$('.scene.on .map').forEach(drawLines); }, 120);
}
addEventListener('resize', onResize);
addEventListener('orientationchange', onResize);

/* ===== CENAS ===== */
const PREV = { 3: 2, 4: 3, 5: 2 };
let tok = 0;
function go(n) {
  const t = ++tok;
  const old = $('.scene.on');
  if (old) { old.classList.remove('on'); setTimeout(() => { if (t === tok) old.hidden = true; }, 600); }
  setTimeout(() => {
    if (t !== tok) return;
    $$('.scene').forEach(s => { if (s !== old) s.hidden = true; });
    const el = $('#s' + n);
    el.hidden = false; el.scrollTop = 0;
    (INIT[n] || (() => {}))();
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('on')));
    const f = $('h1,h2', el); if (f) f.focus({ preventScroll: true });
  }, old ? 620 : 0);
  S.scene = n; save();
  dens = DENS[n] || .6;
  if (!fx) { cd = dens; draw(performance.now()); }
  $('#back').hidden = !PREV[n];
  $('#chap').hidden = n === 1;
  $('#memBtn').hidden = n === 1;
}
$('#back').onclick = () => go(PREV[S.scene]);

/* ===== CENA 1 ===== */
const norm = v => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
let errors = 0;
const keyEl = $('#key');
let kbT = 0;
keyEl.addEventListener('focus', () => {
  clearTimeout(kbT);
  document.body.classList.add('kb');                      // abre espaço extra para o campo poder rolar acima do teclado
  setTimeout(() => keyEl.scrollIntoView({ block: 'center', behavior: 'smooth' }), 350);
});
keyEl.addEventListener('blur', () => { kbT = setTimeout(() => document.body.classList.remove('kb'), 400); });
if (window.visualViewport) visualViewport.addEventListener('resize', () => {
  if (document.activeElement === keyEl) keyEl.scrollIntoView({ block: 'center' });
});
/* tocar em "Abrir"/"dica" não tira o foco do campo antes do clique (evita o layout "pular" e o toque errar o botão) */
$$('#gate button').forEach(b => { b.addEventListener('mousedown', e => e.preventDefault()); b.addEventListener('pointerdown', e => e.preventDefault()); });
$('#gate').addEventListener('submit', e => {
  e.preventDefault();
  const msg = $('#msg');
  if (norm($('#key').value) === KEYWORD) {
    keyEl.blur();
    msg.textContent = '';
    const p = $('#portal'); p.classList.remove('open'); void p.offsetWidth; p.classList.add('open');
    setTimeout(() => go(2), fx ? 900 : 0);
    setTimeout(() => p.classList.remove('open'), 2200);
  } else {
    errors++;
    msg.textContent = ERROR;
    $('#key').select();
    if (errors >= 2) showHint();
  }
});
function showHint() { $('#msg').textContent = HINT; }
$('#hintBtn').onclick = showHint;

/* ===== CENA 2 ===== */
function drawLines(el) {
  const w = el.clientWidth, h = el.clientHeight, svg = $('svg', el), p = $('path', el);
  if (!w || !h || !svg || !p) return;
  svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
  p.setAttribute('d', 'M' + [0, 1, 2].map(i => (FRAG[i].x * w / 100).toFixed(1) + ' ' + (FRAG[i].y * h / 100).toFixed(1)).join('L') + 'Z');
  let len = 2 * (w + h);
  try { len = Math.ceil(p.getTotalLength()) + 2; } catch (e) {}
  p.style.setProperty('--len', len);
}
function buildMap(el, interactive, gold) {
  el.innerHTML = '<svg aria-hidden="true"><path/></svg>';
  FRAG.forEach((f, i) => {
    const s = document.createElement(interactive ? 'button' : 'div');
    s.className = interactive ? 'st' : 'st found'; s.style.left = f.x + '%'; s.style.top = f.y + '%';
    if (interactive) { s.type = 'button'; s.dataset.i = i; }
    el.append(s);
  });
  if (gold) { const g = document.createElement('div'); g.className = 'st goldst'; g.style.left = '86%'; g.style.top = '80%'; el.append(g); }
}
const map2 = $('#map2');
function paint2() {
  $$('.st', map2).forEach((s, i) => {
    const f = S.found.includes(i);
    s.classList.toggle('found', f);
    s.setAttribute('aria-label', 'Fragmento ' + (i + 1) + (f ? ': ' + FRAG[i].w : ', ainda apagado'));
  });
  $('#count').textContent = S.found.length + ' de 3 fragmentos';
  const all = S.found.length === 3;
  map2.classList.toggle('linked', all);
  $('#reveal').disabled = !all;
}
buildMap(map2, true);
map2.addEventListener('click', e => {
  const b = e.target.closest('.st'); if (!b) return;
  const i = +b.dataset.i;
  if (!S.found.includes(i)) { S.found.push(i); save(); }
  $$('.st', map2).forEach(s => s.classList.toggle('sel', s === b));
  $('#frag').innerHTML = '<b></b><p></p>';
  $('#frag b').textContent = FRAG[i].w;
  $('#frag p').textContent = FRAG[i].t;
  paint2();
  if (S.found.length === 3) setTimeout(() => $('#reveal').scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 1400);  // em telas curtas o botão fica abaixo da dobra
});
$('#reveal').onclick = () => go(3);

/* ===== Leitura em etapas (cenas 3, 4 e 5) ===== */
function stepper(id, lines, flag, onDone) {
  const box = $('#l' + id), btn = $('#n' + id), fin = $('#f' + id);
  let i = 0;
  const add = (t, calm) => {
    if (!calm) $$('p', box).forEach(p => p.classList.add('old'));
    const p = document.createElement('p'); p.textContent = t;
    if (calm) p.style.animation = 'none';
    box.append(p);
  };
  const done = () => { btn.hidden = true; fin.hidden = false; S[flag] = true; save(); if (onDone) onDone(); };
  btn.onclick = () => { add(lines[i++]); if (i >= lines.length) done(); else btn.focus({ preventScroll: true }); };
  return () => {
    box.innerHTML = ''; fin.hidden = true; btn.hidden = false; i = 0;
    if (onDone) onDone(false);
    if (S[flag]) { lines.forEach(l => add(l, true)); i = lines.length; done(); } else add(lines[i++]);
  };
}

/* ===== CENA 3 ===== */
const mstar = $('#mstar');
const reset3 = stepper(3, L3, 's3', ok => { mstar.disabled = ok === false; });
mstar.onclick = () => go(4);

/* ===== CENA 4 ===== */
const reset4 = stepper(4, L4, 's4');
$('#to5').onclick = () => go(5);

/* ===== CENA 5 ===== */
const map5 = $('#map5');
const reset5 = stepper(5, L5, 's5', ok => {
  const g = $('.goldst', map5); if (g) g.classList.toggle('show', ok !== false);
});
$('#redo').onclick = () => go(3);
$('#toMap').onclick = () => go(2);

const INIT = {
  2() { drawLines(map2); paint2(); },
  3: reset3,
  4() { reset4(); $$('.cons path').forEach(p => { let l = 400; try { l = Math.ceil(p.getTotalLength()) + 2; } catch (e) {} p.style.setProperty('--len', l); }); },
  5() {
    buildMap(map5, false, true); drawLines(map5);
    map5.classList.remove('linked'); void map5.offsetWidth;
    requestAnimationFrame(() => map5.classList.add('linked'));
    reset5();
  }
};

/* ===== LEMBRANÇAS (rever o que já foi desbloqueado) ===== */
const dlg = $('#mem');
function block(title, arr) {
  const h = document.createElement('h3'); h.textContent = title; $('#memBody').append(h);
  arr.forEach(t => { const p = document.createElement('p'); p.textContent = t; $('#memBody').append(p); });
}
$('#memBtn').onclick = () => {
  $('#memBody').innerHTML = '';
  if (S.found.length) block('Fragmentos', S.found.slice().sort().map(i => FRAG[i].w + ' — ' + FRAG[i].t));
  if (S.s3) block('O instante', L3);
  if (S.s4) block('O segredo do olhar', L4);
  if (!$('#memBody').children.length) block('', ['Nada desbloqueado ainda.']);
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
};
$('#memClose').onclick = () => { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); };
$('#wipe').onclick = () => {
  if (confirm('Apagar todo o progresso neste aparelho e recomeçar?')) {
    try { localStorage.removeItem(KEY); } catch (e) {}
    location.reload();
  }
};

/* ===== INÍCIO ===== */
resize(); applyFx();
const start = S.scene >= 2 && S.scene <= 5 ? S.scene : 1;
go(start);
})();
