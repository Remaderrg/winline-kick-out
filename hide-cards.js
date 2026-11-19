(function (document) {
  var DONE = 'data-slay-kick-removed';
  var TITLE_RE = /проект\s*года\s*на\s*twitch/i;
  var scheduled = false;
  var observer = null;

  function updateSwiper(fromEl) {
    if (!fromEl || !fromEl.closest) return;
    var host = fromEl.closest('.swiper');
    if (!host) return;

    var swiper = host.swiper || (host.__swiper__) || null;
    if (!swiper || typeof swiper.update !== 'function') return;

    try {
      swiper.update();
      if (typeof swiper.slideToClosest === 'function') {
        swiper.slideToClosest(0);
      } else if (typeof swiper.slideTo === 'function') {
        var idx = typeof swiper.activeIndex === 'number' ? swiper.activeIndex : 0;
        swiper.slideTo(Math.min(idx, Math.max(0, (swiper.slides && swiper.slides.length) - 1)), 0);
      }
    } catch (e) {}
  }

  function removeCard(el) {
    if (!el || el.nodeType !== 1 || el.hasAttribute(DONE)) return false;

    var slide =
      el.closest('.nominations__slide') ||
      el.closest('.winners__slide') ||
      el.closest('.swiper-slide') ||
      el;

    if (slide.hasAttribute(DONE)) return false;
    slide.setAttribute(DONE, '1');

    var parent = slide.parentElement;
    slide.remove();
    if (parent) updateSwiper(parent);
    return true;
  }

  function hideProjectYearCards() {
    var changed = false;

    var nom = document.querySelectorAll('[data-nomination-id="8"]');
    for (var i = 0; i < nom.length; i++) {
      if (removeCard(nom[i])) changed = true;
    }

    var slides = document.querySelectorAll(
      '.nominations__slide, .winners__slide, .winner-card'
    );
    for (var j = 0; j < slides.length; j++) {
      var el = slides[j];
      if (el.hasAttribute(DONE)) continue;
      var text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ');
      if (TITLE_RE.test(text)) {
        if (removeCard(el)) changed = true;
      }
    }

    if (changed) {
      document.querySelectorAll('.nominations__swiper, .winners__swiper, .swiper').forEach(function (host) {
        updateSwiper(host);
      });
    }
  }

  function run() {
    if (observer) observer.disconnect();
    hideProjectYearCards();
    if (observer && document.documentElement) {
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      run();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  observer = new MutationObserver(schedule);
  if (document.documentElement) {
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest('[data-winners-year], .winners__year, .nominations')) {
        setTimeout(run, 50);
        setTimeout(run, 300);
      }
    },
    true
  );

  setTimeout(run, 500);
  setTimeout(run, 1500);
})(this.document);
