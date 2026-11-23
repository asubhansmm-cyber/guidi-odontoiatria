(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // nav state + mobile menu
  const nav = $('#nav'), mm = $('#mmenu');
  const onScroll = () => nav.classList.toggle('solid', scrollY > window.innerHeight * 0.7);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('#burger').addEventListener('click', () => mm.classList.toggle('open'));
  $$('a', mm).forEach(a => a.addEventListener('click', () => mm.classList.remove('open')));

  // reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15 });
  $$('.reveal, .doc-img, .bar').forEach(el => io.observe(el));

  // bars
  $$('.bar').forEach(b => b.style.setProperty('--v', b.dataset.v));

  // counters
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, t0 = performance.now();
    const tick = t => { const p = Math.min((t - t0) / 1400, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick); cio.unobserve(el);
  }));
  $$('[data-count]').forEach(el => cio.observe(el));

  // word-by-word scroll reveal
  const rw = $('.reveal-words');
  rw.innerHTML = rw.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  const words = $$('.w', rw);
  const paint = () => {
    const r = rw.getBoundingClientRect(), vh = innerHeight;
    const p = Math.min(Math.max((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0), 1);
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('on', i < n));
  };
  addEventListener('scroll', paint, { passive: true }); paint();

  // hero parallax
  const vid = $('.hero-media video'), card = $('.hero-card');
  addEventListener('scroll', () => {
    const y = Math.min(scrollY, innerHeight);
    if (vid) vid.style.transform = `scale(1.05) translateY(${y * 0.15}px)`;
  }, { passive: true });
  // mouse tilt on hero card
  const hero = $('.hero');
  hero.addEventListener('mousemove', e => {
    if (!card) return;
    const x = (e.clientX / innerWidth - .5) * 14, y = (e.clientY / innerHeight - .5) * 14;
    card.style.translate = `${-x}px ${-y}px`;
  });

  // gallery drag
  const g = $('#gallery'); let down = false, sx = 0, sl = 0;
  g.addEventListener('mousedown', e => { down = true; g.classList.add('drag'); sx = e.pageX; sl = g.scrollLeft; });
  addEventListener('mouseup', () => { down = false; g.classList.remove('drag'); });
  g.addEventListener('mousemove', e => { if (!down) return; e.preventDefault(); g.scrollLeft = sl - (e.pageX - sx); });

  // booking form (preview only)
  const state = { sede: 'Ancona', sala: 'Sala visite', ora: '' };
  $$('.seg, .rooms, .slots').forEach(group => {
    group.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      $$('button', group).forEach(x => x.classList.remove('on'));
      b.classList.add('on'); state[group.dataset.name] = b.dataset.v;
    });
  });

  const date = $('#date'), slots = $('#slots');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const iso = d => d.toISOString().slice(0, 10);
  const fmt = d => d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  const nextOpen = d => { const x = new Date(d); if (x.getDay() === 0) x.setDate(x.getDate() + 1); return x; };
  const first = nextOpen(new Date(today.getTime() + 864e5));
  date.min = iso(first); date.value = iso(first);

  const times = ['09:00', '10:30', '12:00', '15:00', '16:30', '18:00'];
  function renderSlots() {
    const d = new Date(date.value), closed = d.getDay() === 0;
    const seed = d.getDate() + d.getMonth();
    slots.innerHTML = times.map((t, i) => `<button type="button" data-v="${t}" ${closed || (seed + i) % 5 === 0 ? 'disabled' : ''}>${t}</button>`).join('');
    state.ora = '';
  }
  date.addEventListener('change', renderSlots); renderSlots();

  const modal = $('#modal');
  $('#bookForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#name'), tel = $('#tel');
    let ok = true;
    [name, tel].forEach(f => { const bad = !f.value.trim(); f.classList.toggle('err', bad); if (bad) ok = false; });
    if (!state.ora) { slots.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], { duration: 250 }); ok = false; }
    if (!ok) return;
    $('#modalText').textContent = `${name.value.trim()}, ti aspettiamo ${state.sede === 'Ancona' ? 'ad' : 'a'} ${state.sede} (${state.sala}) ${fmt(new Date(date.value))} alle ${state.ora}.`;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
  });
  const close = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); };
  $('#modalClose').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
