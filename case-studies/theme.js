/* Follows the homepage's theme. The homepage keeps the choice in sessionStorage ('theme': 'light' | 'dark')
   and defaults to light, so this does exactly the same. Loaded in <head>, before the stylesheet, so the first
   paint is already the right colour. The storage event keeps an open page in step if the choice changes while
   it is on screen (same tab, same origin, so the homepage's write reaches the page inside its sheet). */
(function () {
  var root = document.documentElement;
  function read() {
    try { return sessionStorage.getItem('theme') === 'dark' ? 'dark' : 'light'; } catch (e) { return 'light'; }
  }
  root.setAttribute('data-theme', read());
  window.addEventListener('storage', function (e) {
    if (e.key === 'theme' || e.key === null) root.setAttribute('data-theme', read());
  });
})();
