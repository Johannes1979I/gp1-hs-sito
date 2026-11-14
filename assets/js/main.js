(() => {
  const V = window.GP1_VIDEO;
  const durate = {};
  const fmt = (s) => s ? Math.floor(s / 60) + ':' + String(Math.round(s % 60)).padStart(2, '0') : '';

  const card = (v, grande) => `
    <button class="vcard play" data-video="${v.id}" data-titolo="${v.titolo}" data-area="${v.area || ''}">
      <span class="vcard__img"><img src="video/poster/${v.id}.jpg" alt="" loading="lazy"><span class="play__btn" aria-hidden="true"></span>
        <span class="vcard__dur" data-dur="${v.id}"></span></span>
      <span class="vcard__txt"><strong>${v.titolo}</strong><span>${v.testo}</span></span>
    </button>`;

  document.getElementById('panoramica').innerHTML = V.panoramica.map(v => card(v, true)).join('');
  document.getElementById('moduli').innerHTML = V.moduli.map(v => card(v)).join('');

  // filtri per area
  const filtri = document.getElementById('filtri');
  filtri.innerHTML = [{ id: 'tutti', nome: 'Tutti' }, ...V.aree].map((a, i) =>
    `<button class="chip${i ? '' : ' is-on'}" role="tab" aria-selected="${!i}" data-area="${a.id}">${a.nome}</button>`).join('');
  const filtra = (area) => {
    filtri.querySelectorAll('.chip').forEach(c => { const on = c.dataset.area === area; c.classList.toggle('is-on', on); c.setAttribute('aria-selected', on); });
    document.querySelectorAll('#moduli .vcard').forEach(c => { c.hidden = !(area === 'tutti' || c.dataset.area === area); });
  };
  filtri.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) filtra(c.dataset.area); });
  document.querySelectorAll('[data-filtro]').forEach(a => a.addEventListener('click', () => filtra('tutti')));

  // durate (indice.json scritto con i video)
  fetch('video/indice.json').then(r => r.ok ? r.json() : {}).then(ix => {
    Object.entries(ix).forEach(([k, v]) => { durate[k] = v.durata; });
    document.querySelectorAll('[data-dur]').forEach(s => { s.textContent = fmt(durate[s.dataset.dur]); });
  }).catch(() => {});

  // lettore
  const dlg = document.getElementById('player'), vid = document.getElementById('playerVideo'), tit = document.getElementById('playerTitle');
  const apri = (id, titolo) => {
    tit.textContent = titolo; vid.poster = `video/poster/${id}.jpg`; vid.src = `video/${id}.mp4`;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    document.body.classList.add('no-scroll');
    const p = vid.play(); if (p && p.catch) p.catch(() => {});
  };
  const chiudi = () => { vid.pause(); vid.removeAttribute('src'); vid.load(); if (dlg.open) dlg.close(); document.body.classList.remove('no-scroll'); };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.play'); if (!b) return;
    e.preventDefault(); apri(b.dataset.video, b.dataset.titolo);
  });
  document.getElementById('playerClose').addEventListener('click', chiudi);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) chiudi(); });
  dlg.addEventListener('close', () => { vid.pause(); document.body.classList.remove('no-scroll'); });

  // menu su telefono
  const t = document.getElementById('navToggle'), nav = document.getElementById('nav');
  t.addEventListener('click', () => { const o = nav.classList.toggle('is-open'); t.setAttribute('aria-expanded', o); });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) { nav.classList.remove('is-open'); t.setAttribute('aria-expanded', false); } });
})();
