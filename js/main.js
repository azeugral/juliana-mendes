(function () {
  'use strict';
  var d = document, EASE = 'cubic-bezier(.16,.84,.32,1)';
  var WA = '5521974002095';

  /* ---------- hero "galeria no chão" (modelo Veríssimo): as peças dela em quadros; cada uma cobre a anterior
     em tinta, um quadro depois do outro. WebGL no PC, MP4 no celular em pé ---------- */
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero = d.querySelector('.gal'), cena = d.querySelector('.gal-cena'), V = '?v=1', INTRO = 2.4;
  var baixa = function () { return innerHeight <= 520 && innerWidth > innerHeight; };
  var celPe = function () { return innerWidth <= 860 && !baixa(); };
  function estatico() { cena.classList.add('est'); }
  function iniciaGL(celular) {
    if (!window.galeria || !window.GALERIA) return false;
    if (!d.createElement('canvas').getContext('webgl')) return false;
    var cv = d.querySelector('.g-gl'), imgs = {}, faltam = 0, G = null, falhou = false;
    var lay = celular ? 'cel' : baixa() ? 'baixa' : 'pc', nomes = {};
    window.GALERIA[lay].forEach(function (q) { q.arts.forEach(function (n) { nomes[n] = 1; }); });
    function pronto() {
      if (falhou || faltam) return;
      var fd = celular ? [.9, 1] : lay === 'baixa' ? [.5, .9] : [.66, 1];
      try { G = window.galeria(cv, { imgs: imgs, quadros: window.GALERIA[lay].map(function (q) { return Object.assign({}, q); }), fundo: fd }); } catch (e) { G = null; }
      if (!G) { falhou = true; if (!celular) iniciaVideo(); else estatico(); return; }
      cena.classList.add('gl');
      var t0 = 0, vis = true, raf = 0, pausa = 0, tp = 0;
      function quadro(ts) {
        if (!t0) t0 = ts;
        if (pausa) { t0 += ts - pausa; pausa = 0; }
        G.desenha((ts - t0) / 1000, devicePixelRatio || 1);
        tp = ts;
        raf = vis ? requestAnimationFrame(quadro) : 0;
      }
      new IntersectionObserver(function (es) {
        vis = es[0].isIntersecting;
        if (!vis) pausa = tp;
        if (vis && !raf) raf = requestAnimationFrame(quadro);
      }).observe(cena);
      raf = requestAnimationFrame(quadro);
    }
    Object.keys(nomes).forEach(function (n) {
      faltam++;
      var im = new Image(); im.decoding = 'async'; im.src = 'img/galeria/' + n + '.webp' + V; imgs[n] = im;
      im.onload = function () { faltam--; pronto(); };
      im.onerror = function () { if (!falhou) { falhou = true; if (!celular) iniciaVideo(); else estatico(); } };
    });
    return true;
  }
  var videoTentado = false;
  function iniciaVideo() {
    if (videoTentado) return; videoTentado = true;
    var v = d.querySelector('.g-video');
    v.src = 'img/galeria/galeria.mp4' + V; v.preload = 'auto';
    var p = v.play();
    if (p && p.catch) p.catch(function () { if (!cena.classList.contains('gl') && !iniciaGL(true)) estatico(); });
    v.addEventListener('playing', function () { cena.classList.add('vd'); }, { once: true });
    v.addEventListener('ended', function () { v.currentTime = INTRO; v.play().catch(function () {}); });
    v.addEventListener('error', function () { if (!iniciaGL(true)) estatico(); });
    d.addEventListener('visibilitychange', function () { if (!d.hidden && cena.classList.contains('vd')) v.play().catch(function () {}); });
  }
  if (hero) {
    if (reduz) estatico();
    else if (celPe()) iniciaVideo();
    else if (!iniciaGL(false)) iniciaVideo();
    requestAnimationFrame(function () { hero.classList.add('pronto'); });
  }

  /* ---------- nav ---------- */
  var nav = d.getElementById('nav'), navbt = d.getElementById('navbt'), menu = d.getElementById('menu');
  function solida() { nav.classList.toggle('solida', window.scrollY > 40 || menu.classList.contains('aberto')); }
  window.addEventListener('scroll', solida, { passive: true }); solida();
  navbt.addEventListener('click', function () {
    var ab = menu.classList.toggle('aberto'); navbt.setAttribute('aria-expanded', ab); solida();
  });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') { menu.classList.remove('aberto'); navbt.setAttribute('aria-expanded', 'false'); solida(); } });

  /* ---------- trabalhos ---------- */
  var OB = window.OBRAS || [], grade = d.getElementById('grade'), maisBt = d.getElementById('mais');
  var filtro = 'todas', mostrar = 24, lista = [];
  function render() {
    lista = OB.filter(function (o) { return filtro === 'todas' || o.z === filtro; });
    grade.innerHTML = lista.slice(0, mostrar).map(function (o, i) {
      return '<button class="peca" data-i="' + i + '" aria-label="' + o.t + '"><img src="img/t/' + o.n + '.webp" alt="' + o.t + '" width="720" height="900"></button>';
    }).join('');
    maisBt.parentNode.hidden = lista.length <= mostrar;
  }
  d.querySelectorAll('[data-f]').forEach(function (b) {
    b.addEventListener('click', function () {
      d.querySelectorAll('[data-f]').forEach(function (x) { x.setAttribute('aria-selected', x === b); });
      filtro = b.dataset.f; mostrar = 24; render();
      grade.animate([{ opacity: .2, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: EASE });
    });
  });
  maisBt.addEventListener('click', function () { mostrar += 24; render(); });
  render();

  /* ---------- designs disponíveis (pasta do Drive dela) ---------- */
  var flash = d.getElementById('flash'), FL = window.DESIGNS || [], h = '';
  FL.forEach(function (t, i) {
    var n = (i < 10 ? '0' : '') + i;
    h += '<figure class="des-q rev"><div class="des-img"><img src="img/designs/' + n + '.webp" alt="Design disponível: ' + t + '" width="1000" height="1250"></div>' +
      '<figcaption>' + t + '</figcaption><button type="button" data-flash="' + i + '">Quero este</button></figure>';
  });
  flash.innerHTML = h;

  var form = d.getElementById('form'), erro = d.getElementById('erro');
  function marca(nome, valor) { var r = form.querySelector('input[name=' + nome + '][value="' + valor + '"]'); if (r) r.checked = true; }
  function preenche(texto) {
    if (texto) form.ideia.value = texto;
    d.getElementById('marcar').scrollIntoView({ behavior: reduz ? 'auto' : 'smooth' });
    setTimeout(function () { form.nome.focus({ preventScroll: true }); }, 700);
  }
  flash.addEventListener('click', function (e) {
    var b = e.target.closest('[data-flash]'); if (!b) return;
    marca('estilo', 'Design disponível');
    preenche('Quero o design "' + FL[+b.dataset.flash] + '" (nº ' + (+b.dataset.flash + 1) + ') que vi no site.');
  });

  /* ---------- lightbox ---------- */
  var lb = d.getElementById('lb'), lbimg = d.getElementById('lbimg'), lbcap = d.getElementById('lbcap'), li = 0, lbl = lista, voltaFoco = null;
  function abre(i, l) {
    lbl = l || lbl; li = (i + lbl.length) % lbl.length; var o = lbl[li];
    lbimg.src = 'img/g/' + o.n + '.webp'; lbimg.alt = o.t; lbcap.textContent = o.t;
    if (lb.hidden) {
      voltaFoco = d.activeElement; lb.hidden = false; d.body.style.overflow = 'hidden';
      lb.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: EASE });
      d.getElementById('lbx').focus();
    }
  }
  function fecha() { lb.hidden = true; d.body.style.overflow = ''; if (voltaFoco) voltaFoco.focus({ preventScroll: true }); }
  grade.addEventListener('click', function (e) { var b = e.target.closest('.peca'); if (b) abre(+b.dataset.i, lista); });
  d.querySelectorAll('[data-abre]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = OB.findIndex(function (o) { return o.n === b.dataset.abre; }); if (k >= 0) abre(k, OB);
    });
  });
  d.getElementById('lbx').addEventListener('click', fecha);
  d.getElementById('lbprev').addEventListener('click', function () { abre(li - 1); });
  d.getElementById('lbnext').addEventListener('click', function () { abre(li + 1); });
  d.getElementById('lbquero').addEventListener('click', function () {
    var o = lbl[li]; fecha();
    marca('estilo', { costas: 'Ornamental', orn: 'Ornamental', tribal: 'Tribal', fech: 'Fechamento' }[o.z]);
    preenche('Quero algo como "' + o.t + '" que vi no site.');
  });
  lb.addEventListener('click', function (e) { if (e.target === lb) fecha(); });
  d.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') fecha();
    if (e.key === 'ArrowRight') abre(li + 1);
    if (e.key === 'ArrowLeft') abre(li - 1);
  });

  /* ---------- formulário → WhatsApp ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = new FormData(form), nome = (f.get('nome') || '').trim();
    if (!nome) { erro.hidden = false; form.nome.focus(); return; }
    erro.hidden = true;
    var l = ['Olá, Juliana! Sou *' + nome + '* e gostaria de um orçamento.', '',
      '*Estilo:* ' + f.get('estilo'),
      '*Cidade:* ' + f.get('cidade'),
      '*Cobertura:* ' + f.get('cobertura')];
    if ((f.get('local') || '').trim()) l.push('*Local:* ' + f.get('local').trim());
    l.push('*Tamanho:* ' + f.get('tamanho'));
    l.push('*Disponibilidade:* ' + f.get('quando'));
    if ((f.get('ideia') || '').trim()) l.push('*Ideia:* ' + f.get('ideia').trim());
    l.push('', '(pedido enviado pelo site)');
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(l.join('\n')), '_blank', 'noopener');
  });
  form.nome.addEventListener('input', function () { if (form.nome.value.trim()) erro.hidden = true; });

  /* ---------- entrada ao rolar ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('vis'); io.unobserve(x.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  d.querySelectorAll('.rev').forEach(function (el) { io ? io.observe(el) : el.classList.add('vis'); });
})();
