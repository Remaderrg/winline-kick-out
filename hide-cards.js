(function (document) {
  var HIDDEN = 'data-slay-kick-card';
  var TITLE_RE = /проект\s*года\s*на\s*twitch/i;
  var scheduled = false;

  function injectCss() {
    if (document.getElementById('slay-kick-cards-css')) return;
    var style = document.createElement('style');
    style.id = 'slay-kick-cards-css';
    style.textContent =
      '[' + HIDDEN + ']{display:none!important;visibility:hidden!important;pointer-events:none!important;}';
    (document.documentElement || document.head || document).appendChild(style);
  }

  function hide(el) {
    if (!el || el.nodeType !== 1 || el.hasAttribute(HIDDEN)) return;
    el.setAttribute(HIDDEN, '1');
  }

  function hideProjectYearCards(root) {
    var scope = root && root.querySelectorAll ? root : document;

    // карточки голосования в карусели номинаций
    var nom = scope.querySelectorAll
      ? scope.querySelectorAll('[data-nomination-id="8"]')
      : [];
    for (var i = 0; i < nom.length; i++) hide(nom[i]);

    // карточки победителей (все годы)
    var slides = scope.querySelectorAll
      ? scope.querySelectorAll('.winners__slide, .winner-card, .nominations__slide')
      : [];
    for (var j = 0; j < slides.length; j++) {
      var el = slides[j];
      var text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ');
      if (TITLE_RE.test(text)) {
        hide(el.closest('.winners__slide') || el.closest('.nominations__slide') || el);
      }
    }
  }

  function run() {
    injectCss();
    hideProjectYearCards(document);
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      run();
    });
  }

  injectCss();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  var observer = new MutationObserver(schedule);
  if (document.documentElement) {
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  document.addEventListener('click', schedule, true);
  setTimeout(run, 500);
  setTimeout(run, 1500);
})(this.document);
