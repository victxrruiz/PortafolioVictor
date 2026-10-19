(function () {
  'use strict';

  var pages = Array.from(document.querySelectorAll('.pages > .page'));
  var navs = [document.getElementById('desktop-nav'), document.getElementById('mobile-nav')];
  var current = Math.max(0, pages.findIndex(function (page) {
    return page.classList.contains('page--current');
  }));
  var busy = false;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var curtain = document.createElement('div');
  curtain.className = 'motion-curtain motion-transition';
  curtain.setAttribute('aria-hidden', 'true');
  for (var i = 0; i < 5; i++) {
    var panel = document.createElement('span');
    panel.className = 'motion-panel';
    curtain.appendChild(panel);
  }
  document.body.appendChild(curtain);
  var panels = Array.from(curtain.children);

  function syncNavigation(index) {
    navs.forEach(function (nav) {
      Array.from(nav.children).forEach(function (item, itemIndex) {
        item.classList.toggle('active', itemIndex === index);
      });
    });
  }

  function switchPage(index) {
    pages[current].classList.remove('page--current');
    pages[index].classList.add('page--current');
    pages[index].scrollTop = 0;
    document.body.classList.toggle('home-page', index === 0);
    current = index;
    syncNavigation(index);
  }

  async function animatePanels(opening) {
    var animations = panels.map(function (panel, index) {
      panel.style.transformOrigin = opening ? 'top' : 'bottom';
      return panel.animate([
        { transform: opening ? 'scaleY(1)' : 'scaleY(0)' },
        { transform: opening ? 'scaleY(0)' : 'scaleY(1)' }
      ], {
        duration: 250,
        delay: index * 30,
        easing: 'cubic-bezier(.76, 0, .24, 1)',
        fill: 'both'
      });
    });
    await Promise.all(animations.map(function (animation) {
      return animation.finished.catch(function () {});
    }));
    panels.forEach(function (panel) {
      panel.style.transform = opening ? 'scaleY(0)' : 'scaleY(1)';
    });
    animations.forEach(function (animation) { animation.cancel(); });
  }

  async function navigate(index) {
    if (busy || index < 0 || index >= pages.length || index === current) return;
    busy = true;
    document.getElementById('trigger-mobile').classList.remove('show-menu');
    document.getElementById('mobile-nav').classList.add('hide-list');
    var intro = document.querySelector('.motion-intro');
    if (intro) intro.hidden = true;
    try {
      if (reducedMotion.matches || !panels[0].animate) {
        switchPage(index);
        return;
      }
      curtain.classList.add('is-active');
      await animatePanels(false);
      switchPage(index);
      await animatePanels(true);
    } finally {
      if (current !== index) switchPage(index);
      curtain.classList.remove('is-active');
      busy = false;
    }
  }

  navs.forEach(function (nav) {
    nav.addEventListener('click', function (event) {
      var item = event.target.closest('li');
      if (!item || item.parentElement !== nav) return;
      event.preventDefault();
      event.stopPropagation();
      navigate(Array.from(nav.children).indexOf(item));
    }, true);
  });

  document.querySelectorAll('#link-about, #link-portfolio, [data-open-portfolio]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      navigate(link.id === 'link-about' ? 1 : 2);
    });
  });
})();
