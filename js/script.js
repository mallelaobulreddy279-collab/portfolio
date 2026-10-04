(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year
  $('#year').textContent = new Date().getFullYear();

  // Hero name: split into letters for the opening reveal
  var nameEl = $('#name');
  var full = nameEl.textContent, idx = 0;
  nameEl.textContent = '';
  full.split(' ').forEach(function (word, wi) {
    var w = document.createElement('span');
    w.className = 'w';
    w.setAttribute('aria-hidden', 'true');
    word.split('').forEach(function (ch) {
      var l = document.createElement('span');
      l.className = 'l';
      l.textContent = ch;
      l.style.setProperty('--i', idx++);
      l.style.setProperty('--d', '0.5s');
      w.appendChild(l);
    });
    nameEl.appendChild(w);
    if (wi < full.split(' ').length - 1) nameEl.appendChild(document.createTextNode(' '));
  });

  // Loader
  var loader = $('#loader');
  var hide = function () { loader.classList.add('done'); };
  window.addEventListener('load', function () { setTimeout(hide, reduce ? 0 : 900); });
  setTimeout(hide, 3000);

  // Typing effect
  var phrases = ['B.Tech CSE Student', 'Python and Java Learner', 'Aspiring Software Developer'];
  var typed = $('#typed'), p = 0, c = 0, del = false;
  function type() {
    var t = phrases[p];
    typed.textContent = t.slice(0, c);
    if (!del && c === t.length) { del = true; return setTimeout(type, 1600); }
    if (del && c === 0) { del = false; p = (p + 1) % phrases.length; }
    c += del ? -1 : 1;
    setTimeout(type, del ? 35 : 75);
  }
  if (reduce) { typed.textContent = phrases[0]; } else { setTimeout(type, 1800); }

  // Nav: scroll state, progress bar, back-to-top
  var nav = $('#nav'), bar = $('#progress'), topBtn = $('#top');
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('scrolled', y > 40);
    topBtn.classList.toggle('show', y > 500);
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  // Mobile menu
  var burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // Active navigation + reveal on scroll
  if ('IntersectionObserver' in window) {
    var links = $$('#menu a');
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { secObs.observe(s); });

    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); revObs.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    $$('.reveal').forEach(function (el) { revObs.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  // Cursor spotlight and card glow
  var spot = $('#spot');
  window.addEventListener('pointermove', function (e) {
    spot.style.setProperty('--x', e.clientX + 'px');
    spot.style.setProperty('--y', e.clientY + 'px');
  }, { passive: true });
  $$('.card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // Particle network background
  var cv = $('#bg'), ctx = cv.getContext && cv.getContext('2d');
  if (ctx && !reduce) {
    var W, H, pts = [], mouse = { x: -999, y: -999 }, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var resize = function () {
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(90, Math.floor(W * H / 16000));
      pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 });
    };
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    var frame = function () {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var a = pts[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        var dx = a.x - mouse.x, dy = a.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 140) { a.x += dx / d * 1.2; a.y += dy / d * 1.2; }
        ctx.fillStyle = 'rgba(56,225,255,.7)';
        ctx.beginPath(); ctx.arc(a.x, a.y, 1.4, 0, 6.283); ctx.fill();
        for (var j = i + 1; j < pts.length; j++) {
          var b = pts[j], ex = a.x - b.x, ey = a.y - b.y, dist = Math.sqrt(ex * ex + ey * ey);
          if (dist < 130) {
            ctx.strokeStyle = 'rgba(139,92,246,' + (0.22 * (1 - dist / 130)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(frame);
    };
    resize();
    frame();
  }

  // Hero parallax
  var heroImg = $('.hero-img');
  if (!reduce && heroImg) {
    window.addEventListener('pointermove', function (e) {
      var x = (e.clientX / window.innerWidth - .5) * 14, y = (e.clientY / window.innerHeight - .5) * 14;
      heroImg.style.translate = x + 'px ' + y + 'px';
    }, { passive: true });
  }

  // Contact form validation (no backend: opens the visitor's mail app)
  var form = $('#form'), status = $('#status');
  var rules = {
    fName: function (v) { return v.trim().length >= 2 ? '' : 'Enter your name (at least 2 characters).'; },
    fEmail: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address.'; },
    fMsg: function (v) { return v.trim().length >= 10 ? '' : 'Write a message of at least 10 characters.'; }
  };
  function check(id) {
    var el = document.getElementById(id), msg = rules[id](el.value);
    el.classList.toggle('bad', !!msg);
    el.parentNode.querySelector('small').textContent = msg;
    return !msg;
  }
  Object.keys(rules).forEach(function (id) { document.getElementById(id).addEventListener('blur', function () { check(id); }); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = Object.keys(rules).map(check).every(Boolean);
    if (!ok) { status.textContent = 'Fix the highlighted fields and send again.'; return; }
    var subject = encodeURIComponent('Portfolio message from ' + $('#fName').value.trim());
    var body = encodeURIComponent($('#fMsg').value.trim() + '\n\nFrom: ' + $('#fName').value.trim() + ' (' + $('#fEmail').value.trim() + ')');
    status.textContent = 'Opening your email app to send the message.';
    window.location.href = 'mailto:mallelaobulreddy279@gmail.com?subject=' + subject + '&body=' + body;
    form.reset();
  });
})();
