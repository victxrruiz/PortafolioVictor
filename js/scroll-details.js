(function () {
  'use strict';

  if (!('IntersectionObserver' in window)) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var observers = [];
  var initialized = new WeakSet();
  var selector = [
    '.about-intro p',
    '.about-list',
    '.box-stats',
    '.about-actions',
    '.custom-title',
    '.expertise-heading',
    '.expertise-table tbody tr',
    '.resume-box li'
  ].join(', ');

  function reveal(element) {
    element.classList.remove('is-scroll-pending');
    // Only stagger the entrance, not future hover or focus effects.
    element.addEventListener('transitionend', function () {
      element.classList.remove('scroll-detail');
      element.style.removeProperty('--scroll-delay');
    }, { once: true });
  }

  function initializeCurrentPage() {
    if (reducedMotion.matches) return;
    var page = document.querySelector('.pages > .page--current');
    if (!page || page.id !== 'about' || initialized.has(page)) return;
    var elements = Array.from(page.querySelectorAll(selector));

    try {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          observer.unobserve(entry.target);
        });
      }, { root: page, threshold: .08, rootMargin: '0px 0px -24px 0px' });

      elements.forEach(function (element) {
        var siblings = Array.from(element.parentElement.children);
        var delay = (siblings.indexOf(element) % 3) * 65;
        element.style.setProperty('--scroll-delay', delay + 'ms');
        element.classList.add('scroll-detail', 'is-scroll-pending');
        observer.observe(element);
      });
      observers.push(observer);
      initialized.add(page);
    } catch (error) {
      elements.forEach(function (element) {
        element.classList.remove('scroll-detail', 'is-scroll-pending');
      });
    }
  }

  var pageObserver = new MutationObserver(initializeCurrentPage);
  document.querySelectorAll('.pages > .page').forEach(function (page) {
    pageObserver.observe(page, { attributes: true, attributeFilter: ['class'] });
  });

  // A keyboard user must never land on an invisible control.
  document.addEventListener('focusin', function (event) {
    var element = event.target.closest('.is-scroll-pending');
    if (element) {
      element.style.setProperty('--scroll-delay', '0ms');
      reveal(element);
    }
  });

  reducedMotion.addEventListener('change', function () {
    if (reducedMotion.matches) {
      observers.forEach(function (observer) { observer.disconnect(); });
      document.querySelectorAll('.is-scroll-pending').forEach(function (element) {
        element.classList.remove('scroll-detail', 'is-scroll-pending');
        element.style.removeProperty('--scroll-delay');
      });
    } else {
      initializeCurrentPage();
    }
  });

  initializeCurrentPage();
})();
