(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  // Nav border + read progress on scroll
  var nav = document.querySelector('.nav');
  var bar = null;
  if (document.querySelector('section.chunk')) {
    bar = document.createElement('div');
    bar.className = 'progress';
    document.body.appendChild(bar);
  }

  if (nav || bar) {
    var ticking = false;
    var paint = function () {
      ticking = false;
      var y = window.scrollY;
      if (nav) nav.classList.toggle('scrolled', y > 16);
      if (bar) {
        var span = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleX(' + (span > 0 ? Math.min(y / span, 1) : 0) + ')';
      }
    };
    var onScroll = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    paint();
  }

  // Fade images in once they decode, so a slow shot never pops
  document.querySelectorAll('.figure img, .screens img, .hero.shot img').forEach(function (img) {
    if (img.complete && img.naturalWidth) { img.classList.add('loaded'); return; }
    img.addEventListener('load', function () { img.classList.add('loaded'); });
    img.addEventListener('error', function () { img.classList.add('loaded'); });
  });

  // Scroll-triggered reveals
  var targets = document.querySelectorAll('.reveal, .project-row');
  if (targets.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    var rows = document.querySelectorAll('.project-row');
    rows.forEach(function (row, i) {
      row.style.transitionDelay = i * 75 + 'ms';
    });
    targets.forEach(function (el) { io.observe(el); });
  }

  // Looping demo clips.
  //
  // The markup deliberately does NOT carry an `autoplay` attribute. If it did,
  // the clip would start on load, off-screen, and keep looping for the whole
  // visit whether or not anyone is looking at it. Instead playback is tied to
  // visibility here.
  //
  // Two things this also buys:
  //   1. prefers-reduced-motion. An autoplaying loop is exactly the kind of
  //      motion that setting exists to stop, and no CSS can stop it. Under
  //      reduce we never call play() and expose controls instead, so the clip
  //      is still watchable — on purpose, not automatically.
  //   2. The no-JS path. Without this script the video never plays, so every
  //      looping clip carries `controls` in the markup as its fallback and we
  //      strip them here only once we know we can drive playback ourselves.
  var loops = document.querySelectorAll('video[data-loop]');
  if (loops.length) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var vio = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting && !reduce.matches) {
          var p = v.play();
          if (p && p.catch) p.catch(function () { v.controls = true; });
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { threshold: 0.25 }) : null;

    loops.forEach(function (v) {
      var apply = function () {
        if (reduce.matches) {
          v.pause();
          v.controls = true;
        } else {
          // Autoplay is only permitted muted, so this is load-bearing, not cosmetic.
          v.muted = true;
          v.controls = false;
        }
      };
      apply();
      // Safari <14 fires no change event on the MQL; addListener is the fallback.
      if (reduce.addEventListener) reduce.addEventListener('change', apply);
      else if (reduce.addListener) reduce.addListener(apply);
      if (vio) vio.observe(v);
    });
  }

  // Theme toggle
  var btn = document.querySelector('.theme-btn');
  var toggleTheme = function () {
    var current = root.getAttribute('data-theme');
    if (!current) {
      current = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    var next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    if (btn) btn.setAttribute('aria-label', 'Switch to ' + (next === 'dark' ? 'light' : 'dark') + ' mode');
  };
  if (btn) btn.addEventListener('click', toggleTheme);

  // Deep-link every numbered section, so one argument can be sent on its own
  document.querySelectorAll('section.chunk').forEach(function (sec) {
    var eyebrow = sec.querySelector('.s-eyebrow');
    var num = eyebrow && eyebrow.querySelector('.s-n');
    if (!eyebrow || !num) return;
    if (!sec.id) sec.id = 'section-' + num.textContent.trim();
    var a = document.createElement('a');
    a.className = 's-anchor';
    a.href = '#' + sec.id;
    a.textContent = '#';
    a.setAttribute('aria-label', 'Link to this section');
    eyebrow.appendChild(a);
  });

  // Lightbox. The Figma boards are unreadable at column width.
  var figs = document.querySelectorAll('.figure img, .screens img');
  if (figs.length) {
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Enlarged image');
    box.innerHTML =
      '<button class="lightbox-close" type="button" aria-label="Close">✕</button>' +
      '<img alt="">' +
      '<span class="lightbox-hint">Esc or click anywhere to close</span>';
    document.body.appendChild(box);

    var boxImg = box.querySelector('img');
    var closeBtn = box.querySelector('.lightbox-close');
    var lastFocus = null;

    var open = function (src, alt) {
      lastFocus = document.activeElement;
      boxImg.src = src;
      boxImg.alt = alt || '';
      box.classList.add('open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };
    var close = function () {
      box.classList.remove('open');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };

    figs.forEach(function (img) {
      img.classList.add('zoomable');
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Enlarge image');
      img.addEventListener('click', function () { open(img.currentSrc || img.src, img.alt); });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img.currentSrc || img.src, img.alt); }
      });
    });

    box.addEventListener('click', close);
    // Trap focus in the dialog while it is open
    box.addEventListener('keydown', function (e) { if (e.key === 'Tab') e.preventDefault(); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && box.classList.contains('open')) close();
    });
  }

  // "t" toggles the theme, unless the user is typing
  document.addEventListener('keydown', function (e) {
    if (e.key !== 't' && e.key !== 'T') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var el = document.activeElement;
    var tag = el ? el.tagName : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (el && el.isContentEditable)) return;
    toggleTheme();
  });
})();
