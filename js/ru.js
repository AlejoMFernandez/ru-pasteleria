// RU · Pastelería & Café — demo
import { initKit } from '../kit/kit.js?v=1';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const html = document.documentElement;
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plata = (n) => n == null ? 'A confirmar' : '$' + Math.round(n).toLocaleString('es-AR');

/* ---------- alto de pantalla estable (no salta con la barra del navegador) ---------- */
let anchoPrev = 0;
const fijarAlto = () => { if (innerWidth === anchoPrev) return; anchoPrev = innerWidth; html.style.setProperty('--alto', innerHeight + 'px'); };
fijarAlto(); addEventListener('resize', fijarAlto);

/* ---------- paños: la firma "vidrio repartido" ---------- */
function armarPanos(el, c, f) {
  c = c || +getComputedStyle(el).getPropertyValue('--c') || 3;
  f = f || +getComputedStyle(el).getPropertyValue('--f') || 4;
  el.innerHTML = '';
  const cx = (c - 1) / 2, cy = (f - 1) / 2;
  for (let y = 0; y < f; y++) for (let x = 0; x < c; x++) {
    const i = document.createElement('i');
    i.style.setProperty('--k', (Math.abs(x - cx) + Math.abs(y - cy)).toFixed(1));
    el.appendChild(i);
  }
}
$$('.panos').forEach(p => armarPanos(p));
armarPanos($('.puerta__reja'), 3, 6);
armarPanos($('.intro__reja'), 3, 6);

/* ---------- abierto / cerrado (bio + Google Maps) ---------- */
const HORARIO = { 0: [9, 20], 1: null, 2: [9, 16], 3: [9, 20], 4: [9, 20], 5: [9, 20], 6: [9, 20] };
const DIAS = ['el domingo', 'el lunes', 'el martes', 'el miércoles', 'el jueves', 'el viernes', 'el sábado'];
function estado() {
  const a = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
  const d = a.getDay(), h = a.getHours() + a.getMinutes() / 60, hoy = HORARIO[d];
  if (hoy && h >= hoy[0] && h < hoy[1]) return { abierto: true, txt: `Abierto hoy hasta las ${hoy[1]}:00 hs` };
  if (hoy && h < hoy[0]) return { abierto: false, txt: `Hoy abrimos a las ${hoy[0]}:00 hs` };
  for (let k = 1; k <= 7; k++) {
    const dd = (d + k) % 7, hh = HORARIO[dd];
    if (hh) return { abierto: false, txt: `Cerrado ahora · abrimos ${k === 1 ? 'mañana' : DIAS[dd]} a las ${hh[0]}:00 hs` };
  }
}
const e0 = estado();
$$('[data-estado]').forEach(el => { el.textContent = e0.txt; el.classList.toggle('abierto', e0.abierto); });

/* ---------- intro: la puerta esmerilada se achica hasta la puerta ---------- */
const intro = $('.intro');
[...$$('.heroA__texto > *'), $('.cartel'), ...$$('.heroA__rotulos li'), $('.farol')].forEach((el, i) => { el.classList.add('entra'); el.style.setProperty('--d', i); });
const abrirHero = () => { html.classList.add('listo'); $('.puerta').classList.add('visto'); };
const terminarIntro = () => { html.classList.remove('trabado'); intro?.remove(); };
if (html.classList.contains('con-intro') && intro) {
  html.classList.add('trabado');
  const foto = $('.puerta__vista img');
  const fotoLista = foto.complete ? Promise.resolve() : new Promise(r => { foto.onload = foto.onerror = r; });
  Promise.all([new Promise(r => setTimeout(r, 480)), Promise.race([Promise.all([document.fonts?.ready, fotoLista]), new Promise(r => setTimeout(r, 1100))])]).then(() => {
    const r = $('.puerta').getBoundingClientRect();
    intro.classList.add('vuela');
    intro.style.transform = `translate(${r.left}px, ${r.top}px) scale(${r.width / innerWidth}, ${r.height / innerHeight})`;
    setTimeout(() => { abrirHero(); intro.classList.add('fuera'); setTimeout(terminarIntro, 220); }, 320);
  });
} else { abrirHero(); terminarIntro(); }

/* ---------- al scrollear se entra por la puerta ---------- */
const heroA = $('.heroA');
if (!reducido) {
  const puerta = $('.puerta');
  const manija = $('.puerta__manija'), reja = $('.puerta__reja');
  const resto = [$('.heroA__texto'), $('.heroA__rotulos'), $('.cartel'), $('.farol')];
  let pend = false;
  const pintar = () => {
    pend = false;
    const total = heroA.offsetHeight - innerHeight;
    const p = Math.min(1, Math.max(0, -heroA.getBoundingClientRect().top / total));
    if (p > 1.2) return;
    const ease = p * p * (3 - 2 * p);
    puerta.style.transform = 'none';
    const r = puerta.getBoundingClientRect();
    const S = Math.max(innerWidth / r.width, innerHeight / r.height) * 1.12;
    const dx = innerWidth / 2 - (r.left + r.width / 2), dy = innerHeight / 2 - (r.top + r.height / 2);
    puerta.style.transform = p > 0 ? `translate(${dx * ease}px, ${dy * ease}px) scale(${1 + (S - 1) * ease})` : '';
    const o = Math.max(0, 1 - p * 3);
    resto.forEach(el => { el.style.opacity = o; el.style.visibility = o < .02 ? 'hidden' : ''; });
    const om = Math.max(0, 1 - p * 2.2); manija.style.opacity = om; reja.style.opacity = Math.max(0, 1 - p * 1.4);
  };
  addEventListener('scroll', () => { if (!pend) { pend = true; requestAnimationFrame(pintar); } }, { passive: true });
  addEventListener('resize', () => requestAnimationFrame(pintar));
}

/* ---------- barra y píldora del panel ---------- */
const barra = $('[data-barra]');
new IntersectionObserver(([en]) => barra.classList.toggle('ver', !en.isIntersecting), { rootMargin: '0px 0px -40% 0px' }).observe(heroA);
const visibles = new Set();
const celu = matchMedia('(max-width: 899px)');
// en el celu la píldora del panel solo aparece al final (cómo llegar y pie), así no tapa nada con la barra
const finales = new Set([$('#llegar'), $('.pie')]);
const ojoPill = new IntersectionObserver(ens => {
  ens.forEach(en => en.isIntersecting ? visibles.add(en.target) : visibles.delete(en.target));
  const alFinal = [...visibles].some(v => finales.has(v)), tapa = [...visibles].some(v => !finales.has(v));
  html.classList.toggle('oculta-pill', celu.matches ? !alFinal : tapa);
}, { threshold: .15 });
[heroA, $('.tablon'), $('#llegar'), $('.pie')].forEach(el => ojoPill.observe(el));

/* ---------- entradas al scrollear ---------- */
const io = new IntersectionObserver(ens => ens.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add('visto'); io.unobserve(en.target); }
}), { threshold: .18 });
const observar = (root = document) => $$('.rv:not(.visto), .vidrio:not(.visto):not(.ficha__foto):not(.pop__foto)', root).forEach(el => io.observe(el));
observar();

/* ---------- filas que se arrastran con el mouse ---------- */
$$('.fila').forEach(fila => {
  let x, sl, abajo = false, mov = false;
  fila.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; abajo = true; mov = false; x = e.clientX; sl = fila.scrollLeft; });
  addEventListener('pointermove', e => { if (!abajo) return; const d = e.clientX - x; if (Math.abs(d) > 4) { mov = true; fila.style.scrollSnapType = 'none'; } if (mov) fila.scrollLeft = sl - d; });
  addEventListener('pointerup', () => { if (!abajo) return; abajo = false; fila.style.scrollSnapType = ''; });
});

/* ---------- popups propios (vitrina) ---------- */
const pop = $('[data-pop]'); let volverA = null, scrollY0 = 0;
function abrirPop(dato, desde) {
  const img = $('[data-pop-img]', pop), fig = img.closest('.vidrio');
  fig.classList.remove('visto'); img.src = dato.foto; img.alt = dato.nombre;
  $('[data-pop-t]', pop).textContent = dato.nombre;
  $('[data-pop-d]', pop).textContent = dato.descripcion || '';
  $('[data-pop-entera]', pop).hidden = !dato.entera;
  volverA = desde; scrollY0 = scrollY;
  document.body.style.cssText = `position:fixed;top:${-scrollY0}px;left:0;right:0`;
  pop.hidden = false; html.classList.add('kit-lock-ru');
  requestAnimationFrame(() => requestAnimationFrame(() => fig.classList.add('visto')));
  $('.ficha__x', pop).focus({ preventScroll: true });
}
function cerrarPop() {
  if (pop.hidden) return;
  pop.hidden = true; html.classList.remove('kit-lock-ru'); document.body.style.cssText = ''; scrollTo(0, scrollY0);
  volverA?.focus({ preventScroll: true });
}
$$('[data-pop-cerrar]', pop).forEach(b => b.addEventListener('click', cerrarPop));
$('[data-pop-entera]', pop).addEventListener('click', (e) => { e.preventDefault(); cerrarPop(); $('#encargos').scrollIntoView({ behavior: 'smooth' }); });

/* ---------- la vitrina, los combos y la tienda salen de la carta del kit ---------- */
const FOTO_GRANDE = { 'c-lima': 'v-lima', 'c-rogel': 'v-rogel', 'c-choco': 'v-choco', 'c-vasca': 'v-vasca', 'c-crumble': 'v-crumble', 'c-brownie': 'v-brownie', 'c-frutos': 'v-frutos' };
const grande = (f) => { const k = (f || '').replace(/^img\//, '').replace(/\.webp$/, ''); return FOTO_GRANDE[k] ? `img/${FOTO_GRANDE[k]}.webp` : f; };
let enteras = new Set();
let datosVitrina = [];
function pintarVitrina(prods) {
  const el = $('[data-vitrina]');
  datosVitrina = prods.filter(p => p.categoria === 'pasteleria' && p.foto && p.disponible !== false).slice(0, 7)
    .map(p => ({ ...p, foto: grande(p.foto), entera: enteras.has(p.nombre.toLowerCase()) }));
  el.innerHTML = datosVitrina.map((p, i) => `<button type="button" class="pieza" data-i="${i}" aria-label="${esc(p.nombre)}: ver de cerca">
      <span class="vidrio"><img src="${esc(p.foto)}" width="560" height="747" alt="" loading="lazy"><span class="panos" aria-hidden="true"></span></span>
      <span class="rotulo">${esc(p.nombre)}</span></button>`).join('')
    + `<a class="pieza pieza--carta" href="carta/"><b>La carta completa</b><span>Pastelería, brunch, sándwiches y café →</span></a>`;
  $$('.panos', el).forEach(p => armarPanos(p));
  observar(el);
}
$('[data-vitrina]').addEventListener('click', e => { const b = e.target.closest('.pieza[data-i]'); if (b) abrirPop(datosVitrina[+b.dataset.i], b); });

function pintarCombos(prods) {
  $('[data-combos]').innerHTML = prods.filter(p => p.categoria === 'brunch' && p.disponible !== false)
    .map(p => `<li><b>${esc(p.nombre)}</b><p>${esc(p.descripcion)}</p></li>`).join('');
}

let tienda = [], tab = 't-tortas';
function pintarTienda() {
  const ul = $('[data-tienda]');
  const lista = tienda.filter(p => p.categoria === tab);
  ul.classList.remove('todas');
  ul.innerHTML = lista.map((p, i) => `<li style="--i:${i}"${i >= 5 ? ' class="extra"' : ''}>
      ${p.foto ? `<img class="mini" src="${esc(p.foto)}" width="64" height="64" alt="" loading="lazy">` : '<span class="mini mini--vacia" aria-hidden="true">RU</span>'}
      <div><b>${esc(p.nombre)}</b><small>${esc(p.descripcion)}</small><em>${plata(p.precio)}</em></div>
      <span data-kit-qty="${esc(p.id)}"></span></li>`).join('');
  const mas = $('[data-mas]'); mas.hidden = lista.length <= 5; mas.textContent = `Ver las ${lista.length}`;
  window.KIT?.carrito?.sync(ul);
}
$('[data-mas]').addEventListener('click', e => { $('[data-tienda]').classList.add('todas'); e.currentTarget.hidden = true; });
$$('.pestanas [data-tab]').forEach(b => b.addEventListener('click', () => {
  tab = b.dataset.tab;
  $$('.pestanas [data-tab]').forEach(x => x.setAttribute('aria-selected', x === b));
  pintarTienda();
}));

document.addEventListener('kit:carta', (e) => {
  const { el, productos } = e.detail;
  if (el.id === 'tienda-datos') {
    tienda = productos.filter(p => p.disponible !== false);
    enteras = new Set(tienda.filter(p => p.categoria === 't-tortas').map(p => p.nombre.toLowerCase()));
    pintarTienda();
    if (datosVitrina.length) datosVitrina.forEach(d => (d.entera = enteras.has(d.nombre.toLowerCase())));
  } else if (el.id === 'carta-datos') {
    pintarVitrina(productos); pintarCombos(productos);
  }
});

const contar = () => {
  const n = (window.KIT?.carrito?.lineas || []).reduce((a, l) => a + (l.cant || 0), 0);
  $$('[data-n]').forEach(x => (x.textContent = n));
  const b = $('.barra__enc'); b.hidden = n === 0; barra.classList.toggle('con-enc', n > 0);
};
document.addEventListener('kit:carrito', contar);

/* ---------- WOW: la mesa larga ---------- */
const FOTOS_EV = [[/acuarela|pint/i, 'img/ev-acuarela.webp'], [/ramo|flor/i, 'img/ev-ramos.webp'], [/foto|c[aá]mara/i, 'img/ev-foto.webp'], [/cena|chef|men[uú]/i, 'img/ev-cena.webp']];
const fotoEv = (ev, i) => (FOTOS_EV.find(([re]) => re.test(ev.nombre + ' ' + (ev.tipo || '')))?.[1]) || ['img/ev-foto.webp', 'img/ev-acuarela.webp', 'img/ev-ramos.webp', 'img/ev-cena.webp'][i % 4];
const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
const DCORTO = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const DLARGO = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MLARGO = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const fecha = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const lugares = $('[data-lugares]'), ficha = $('[data-ficha]'), invita = $('[data-invita]');
let eventos = [], ultimo = null, actual = null;
function pintarMesa(lista) {
  eventos = lista.slice(0, 4);
  if (!eventos.length) {
    lugares.innerHTML = '<p class="mesa__vacia">Pronto, nuevas fechas.</p>'; invita.hidden = true; return;
  }
  invita.hidden = false;
  lugares.innerHTML = eventos.map((ev, i) => {
    const f = fecha(ev.fecha);
    return `<button type="button" class="lugar" data-i="${i}" aria-label="${esc(ev.nombre)}, ${DLARGO[f.getDay()]} ${f.getDate()} de ${MLARGO[f.getMonth()]}">
      <span class="lugar__plato"><img src="${fotoEv(ev, i)}" alt="" width="420" height="420" loading="lazy"></span>
      <span class="lugar__tarjeta"><span class="lugar__fecha">${DCORTO[f.getDay()]} ${f.getDate()} ${MESES[f.getMonth()]}</span><span class="lugar__nombre">${esc(ev.nombre)}</span></span></button>`;
  }).join('');
}
async function abrirFicha(i, desde) {
  const ev = eventos[i]; actual = ev;
  $$('.lugar').forEach(l => l.classList.toggle('activo', +l.dataset.i === i));
  const f = (k) => $(`[data-f="${k}"]`, ficha), d = fecha(ev.fecha);
  f('tipo').textContent = (window.KIT?.config?.eventosTipos || []).find(t => t.id === ev.tipo)?.nombre || 'Encuentro';
  f('titulo').textContent = ev.nombre;
  f('cuando').textContent = `${DLARGO[d.getDay()]} ${d.getDate()} de ${MLARGO[d.getMonth()]} · ${ev.hora} hs`;
  f('desc').textContent = ev.descripcion || '';
  f('precio').textContent = ev.precio ? `${plata(ev.precio)} por persona` : 'Precio a confirmar';
  const img = f('foto'); img.src = fotoEv(ev, i); img.alt = ev.nombre;
  const fig = $('.ficha__foto', ficha); fig.classList.remove('visto');
  ficha.hidden = false; invita.classList.add('chau'); $('.tablon__madera').classList.add('con-ficha'); html.classList.add('ficha-abierta');
  if (celu.matches) { const r = ficha.getBoundingClientRect(); const falta = r.bottom - (innerHeight - 12); if (falta > 0 || r.top < 0) scrollBy({ top: r.top < 0 ? r.top - 12 : falta, behavior: 'smooth' }); }
  requestAnimationFrame(() => requestAnimationFrame(() => fig.classList.add('visto')));
  ultimo = desde; $('[data-cerrar]', ficha).focus({ preventScroll: true });
  // cupo real: lo que queda libre en la inscripción del kit
  let cap = Number(ev.cupo) || 0, libres = cap;
  try {
    const t = (await window.KIT.reservas.turnos(ev.fecha, 1)).find(x => x.hora === ev.hora);
    if (t) { cap = t.capacidad ?? cap; libres = t.libres ?? libres; }
  } catch (_) { /* sin datos: se muestra el cupo total */ }
  if (actual !== ev) return;
  const n = Math.min(cap, 12), llenas = cap ? Math.round((cap - libres) * n / cap) : 0;
  f('sillas').innerHTML = Array.from({ length: n }, (_, k) => `<i class="${k < llenas ? '' : 'libre'}"></i>`).join('');
  f('cupos').textContent = libres <= 0 ? 'Completo' : libres === 1 ? 'Queda 1 lugar' : `Quedan ${libres} lugares`;
  $('[data-reservar]', ficha).disabled = libres <= 0;
}
function cerrarFicha() {
  if (ficha.hidden) return;
  ficha.hidden = true; actual = null; $('.tablon__madera').classList.remove('con-ficha'); html.classList.remove('ficha-abierta');
  $$('.lugar').forEach(l => l.classList.remove('activo'));
  ultimo?.focus({ preventScroll: true });
}
lugares.addEventListener('click', e => { const l = e.target.closest('.lugar'); if (l) abrirFicha(+l.dataset.i, l); });
$('[data-cerrar]', ficha).addEventListener('click', cerrarFicha);
$('.tablon__madera').addEventListener('click', e => { if (!ficha.hidden && !ficha.contains(e.target) && !e.target.closest('.lugar')) cerrarFicha(); });
addEventListener('keydown', e => { if (e.key === 'Escape') { cerrarFicha(); cerrarPop(); } });
$('[data-reservar]').addEventListener('click', () => {
  if (!actual || !window.KIT?.reservas) return;
  window.KIT.reservas.abrir({ fecha: actual.fecha, hora: actual.hora, personas: 1 });
});
document.addEventListener('kit:eventos', e => pintarMesa(e.detail.proximos || []));
document.addEventListener('kit:reserva-lista', () => { if (actual) { const i = eventos.indexOf(actual); setTimeout(() => abrirFicha(i, ultimo), 400); } });

/* ---------- kit ---------- */
try {
  window.KIT = await initKit({ config: 'cliente.json', imagenes: { lqip: 'img/lqip.json' }, carrito: { fab: false, label: 'Tu encargo' } });
  if (window.KIT.eventos) pintarMesa(window.KIT.eventos.proximos());
  window.KIT.carrito?.sync(document);
  contar();
} catch (err) { console.error('[ru] kit', err); }

/* ---------- índice: la sección actual muestra su nombre (desktop) ---------- */
const links = $$('.barra a[href^="#"]');
const secs = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
const ioIdx = new IntersectionObserver(ens => ens.forEach(en => {
  if (!en.isIntersecting) return;
  links.forEach(a => a.classList.toggle('activa', a.getAttribute('href') === '#' + en.target.id));
}), { rootMargin: '-45% 0px -45% 0px' });
secs.forEach(s => ioIdx.observe(s));
