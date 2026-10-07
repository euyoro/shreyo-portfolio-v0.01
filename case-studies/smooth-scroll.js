// Smooth, inertial scrolling for the case study pages (Lenis, as on the homepage).
// Needs the Lenis script loaded first. Touch and reduced motion keep native scrolling.
(function () {
  if (typeof Lenis === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var lenis = new Lenis({
    lerp: 0.085,
    wheelMultiplier: 1,
    // the image viewer is a modal <dialog>: it locks the body, so leave the wheel alone while it is open
    prevent: function () { return document.body.classList.contains('pg-lb-open') || !!document.querySelector('dialog[open]'); }
  });
  window.__lenis = lenis;
  (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
})();
