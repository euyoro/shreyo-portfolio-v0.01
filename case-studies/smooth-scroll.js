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

  // Lenis only needs a frame while a glide is under way. Left on a permanent requestAnimationFrame it wakes
  // the CPU sixty times a second on a page nobody is touching, so the loop sleeps once the glide has settled
  // and wakes on anything that could start one. The clock is zeroed on wake: Lenis advances by the time since
  // its last frame, and a long gap would otherwise finish the first glide in a single step.
  var id = 0, quiet = 0;
  function tick(t) {
    lenis.raf(t);
    quiet = lenis.isScrolling === 'smooth' ? 0 : quiet + 1;
    id = quiet > 12 ? 0 : requestAnimationFrame(tick);
  }
  function wake() {
    quiet = 0;
    if (!id) { lenis.time = 0; id = requestAnimationFrame(tick); }
  }
  ['wheel', 'touchstart', 'touchmove', 'pointerdown', 'keydown', 'resize'].forEach(function (type) {
    window.addEventListener(type, wake, { passive: true, capture: true });
  });
  lenis.on('scroll', wake);
  var scrollTo = lenis.scrollTo.bind(lenis);
  lenis.scrollTo = function () { wake(); return scrollTo.apply(null, arguments); };
  wake();
})();
