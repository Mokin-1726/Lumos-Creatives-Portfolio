/* =========================================================
   LUMOS CREATIVES — script.js
   Vanilla JavaScript only. Sections:
   0. Config   1. Helpers   2. Navbar + mobile menu   3. Scroll spy
   4. Hero glow   5. Scroll reveal   6. Work filters + images
   7. Process progress   8. Enquiry form   9. Misc
   ========================================================= */

(function () {
  'use strict';

  /* ---------- 0. Config (edit these two lines to receive enquiries) ----------
     Option A: set `email` and the form opens the visitor's email app, pre-filled.
     Option B: set `formEndpoint` (for example a Formspree URL) and the form sends
               the enquiry in the background and shows a confirmation.
     If both are empty the form still validates, but tells the visitor it is not
     connected yet. */
  var CONFIG = {
  email: 'lumoscreatives1726@gmail.com',
  formEndpoint: 'https://formspree.io/f/mzeragje'
};

  /* ---------- 1. Helpers ---------- */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (n, min, max) { return Math.min(max, Math.max(min, n)); };

  /* ---------- 2. Navbar + mobile menu ---------- */
  var nav = $('#nav');
  var toggle = $('#navToggle');
  var menu = $('#mobileMenu');

  function onScroll() {
    nav.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
    // Keep hidden links out of the tab order
    $$('a', menu).forEach(function (a) { a.tabIndex = open ? 0 : -1; });
  }
  setMenu(false);

  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  $$('a', menu).forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 860 && menu.classList.contains('is-open')) setMenu(false);
  });

  /* ---------- 3. Scroll spy (highlights the current section in the navbar) ---------- */
  var spyLinks = $$('[data-spy]');
  var spyTargets = spyLinks
    .map(function (a) { return document.getElementById(a.getAttribute('data-spy')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && spyTargets.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        spyLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('data-spy') === entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spyTargets.forEach(function (t) { spy.observe(t); });

    // Clear the highlight while the hero is on screen
    var home = $('#home');
    if (home) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) spyLinks.forEach(function (a) { a.classList.remove('is-active'); });
      }, { rootMargin: '-45% 0px -50% 0px' }).observe(home);
    }
  }

  /* ---------- 4. Hero glow follows the pointer (fine pointers only) ---------- */
  var hero = $('#home');
  var glow = $('#heroGlow');
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  if (hero && glow && finePointer && !reduceMotion) {
    var raf = null;
    hero.addEventListener('pointermove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var r = hero.getBoundingClientRect();
        glow.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5) * 90);
        glow.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5) * 40);
        raf = null;
      });
    });
    hero.addEventListener('pointerleave', function () {
      glow.style.setProperty('--px', 0);
      glow.style.setProperty('--py', 0);
    });
  }

  /* ---------- 5. Scroll reveal ---------- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- 6. Work filters + optional real project images ---------- */
  var projects = $$('.proj');
  var filterBtns = $$('.filter');

  // If a project has data-image="images/projects/your-file.jpg", show it instead of the placeholder.
  // The image is preloaded first, so a wrong file name never shows a broken image.
  projects.forEach(function (p) {
    var src = p.getAttribute('data-image');
    if (!src) return;
    var media = $('.proj__media', p);
    var img = new Image();
    img.onload = function () {
      img.alt = '';
      img.loading = 'lazy';
      media.appendChild(img);
      var art = $('.proj__art', media);
      var badge = $('.proj__badge', media);
      if (art) art.remove();
      if (badge) badge.remove();
    };
    img.onerror = function () { console.warn('LUMOS: project image not found:', src); };
    img.src = src;
  });

  function layoutOffsets() {
    var visible = projects.filter(function (p) { return !p.hidden; });
    projects.forEach(function (p) { p.classList.remove('is-offset'); });
    visible.forEach(function (p, i) { if (i % 2 === 1) p.classList.add('is-offset'); });
  }

  function applyFilter(cat) {
    projects.forEach(function (p) {
      var show = cat === 'all' || p.getAttribute('data-cat') === cat;
      p.hidden = !show;
      if (show) p.classList.add('is-in'); // make sure revealed state is kept
    });
    layoutOffsets();
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      applyFilter(btn.getAttribute('data-filter'));
    });
  });
  layoutOffsets();

  /* ---------- 7. Process progress line ---------- */
  var steps = $('#steps');
  var stepsFill = $('#stepsFill');
  var stepItems = $$('.step', steps || document);

  function updateSteps() {
    if (!steps || !stepsFill) return;
    var vh = window.innerHeight;
    var r = steps.getBoundingClientRect();
    var p = clamp((vh * 0.8 - r.top) / (r.height + vh * 0.25), 0, 1);
    stepsFill.parentNode.style.setProperty('--p', (p * 100).toFixed(1) + '%');
    stepItems.forEach(function (s, i) {
      s.classList.toggle('is-done', p >= (i + 0.35) / stepItems.length);
    });
  }
  window.addEventListener('scroll', updateSteps, { passive: true });
  window.addEventListener('resize', updateSteps);
  updateSteps();

  /* ---------- 8. Enquiry form ---------- */
  var form = $('#enquiryForm');
  var statusEl = $('#formStatus');
  var submitBtn = $('#formSubmit');

  function setError(id, msg) {
    var err = $('#e-' + id);
    var input = $('#f-' + id);
    if (!err || !input) return;
    err.textContent = msg || '';
    input.closest('.field').classList.toggle('has-error', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (msg) input.setAttribute('aria-describedby', 'e-' + id); else input.removeAttribute('aria-describedby');
  }

  function setStatus(msg, kind) {
    statusEl.textContent = msg || '';
    statusEl.className = 'form__status' + (kind ? ' is-' + kind : '');
  }

  function validate(data) {
    var ok = true;
    var first = null;
    function fail(id, msg) { setError(id, msg); if (!first) first = id; ok = false; }

    if (!data.name.trim()) fail('name', 'Enter your name.'); else setError('name', '');
    if (!data.email.trim()) fail('email', 'Enter your email address.');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email.trim())) fail('email', 'Enter a valid email address, like name@example.com.');
    else setError('email', '');
    if (!data.service) fail('service', 'Select the service you need.'); else setError('service', '');
    if (data.message.trim().length < 10) fail('message', 'Tell us a little about your project (at least 10 characters).'); else setError('message', '');

    if (first) { var el = $('#f-' + first); if (el) el.focus(); }
    return ok;
  }

  if (form) {
    // Clear an error as soon as the visitor edits the field
    $$('input, select, textarea', form).forEach(function (el) {
      el.addEventListener('input', function () {
        if (el.id && el.id.indexOf('f-') === 0) setError(el.id.slice(2), '');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('');

      var fd = new FormData(form);
      var data = {
        name: String(fd.get('name') || ''),
        email: String(fd.get('email') || ''),
        service: String(fd.get('service') || ''),
        budget: String(fd.get('budget') || ''),
        message: String(fd.get('message') || '')
      };

      if (fd.get('company')) return; // spam trap filled in: silently stop
      if (!validate(data)) return;

      if (CONFIG.formEndpoint) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
        fetch(CONFIG.formEndpoint, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: fd
        }).then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          form.reset();
          setStatus('Thank you. Your message has been sent and we will reply soon.', 'ok');
        }).catch(function () {
          setStatus('Your message could not be sent. Please check your connection and try again.', 'err');
        }).then(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send message';
        });
        return;
      }

      if (CONFIG.email) {
        var subject = 'New project enquiry: ' + data.service;
        var body = [
          'Name: ' + data.name,
          'Email: ' + data.email,
          'Service: ' + data.service,
          'Budget: ' + (data.budget || 'Not specified'),
          '',
          data.message
        ].join('\n');
        window.location.href = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        setStatus('Opening your email app with your message ready to send.', 'ok');
        return;
      }

      setStatus('This form is not connected yet. Add your email or form endpoint in script.js (CONFIG).', 'err');
      console.warn('LUMOS: set CONFIG.email or CONFIG.formEndpoint in script.js to receive enquiries.');
    });
  }
    /* ---------- Team filters ---------- */
  var teamBtns = $$('.team-filter');
  var members = $$('.member');

  teamBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var role = btn.getAttribute('data-team');
      teamBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      members.forEach(function (m) {
        m.hidden = !(role === 'all' || m.getAttribute('data-role') === role);
        if (!m.hidden) m.classList.add('is-in');
      });
    });
  });

  /* ---------- 9. Misc ---------- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Placeholder social links should not jump the page to the top
  $$('a[data-placeholder]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });
})();
document.querySelectorAll('.proj__media video').forEach(function (video) {
  var box = video.parentElement;
  var btn = box.querySelector('.proj__play');

  function start() {
    document.querySelectorAll('.proj__media video').forEach(function (v) {
      if (v !== video) v.pause();
    });
    video.controls = true;
    video.play();
  }

  btn.addEventListener('click', start);
  video.addEventListener('click', function () { if (video.paused && !video.controls) start(); });
  video.addEventListener('play', function () { box.classList.add('is-playing'); });
  video.addEventListener('pause', function () { box.classList.remove('is-playing'); });
  video.addEventListener('ended', function () { box.classList.remove('is-playing'); });
});
