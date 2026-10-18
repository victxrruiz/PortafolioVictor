(function () {
  'use strict';

  var gallery = document.getElementById('grid-gallery');
  if (!gallery) return;

  var placeholder = 'img/projects/placeholder.svg';
  // Sustituye los seis archivos de cada categoría por las imágenes de tus proyectos.
  var categories = [
    { id: 'social-media', title: 'Social Media', icon: 'fa-comments', images: [placeholder, placeholder, placeholder, placeholder, placeholder, placeholder] },
    { id: 'editorial', title: 'Editorial', icon: 'fa-book', images: [placeholder, placeholder, placeholder, placeholder, placeholder, placeholder] },
    { id: 'branding', title: 'Marca / Branding', icon: 'fa-pencil', images: [placeholder, placeholder, placeholder, placeholder, placeholder, placeholder] },
    { id: 'escenografia', title: 'Escenografía / Stands', icon: 'fa-cubes', images: [placeholder, placeholder, placeholder, placeholder, placeholder, placeholder] },
    { id: 'espacios', title: 'Intervención de espacios', icon: 'fa-building-o', images: [placeholder, placeholder, placeholder, placeholder, placeholder, placeholder] },
    { id: 'fotografia', title: 'Fotografía', icon: 'fa-camera', images: [placeholder, placeholder, placeholder, placeholder, placeholder, placeholder] }
  ];

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  // Enhance the template's fallback gallery before the legacy gallery initializes.
  gallery.replaceChildren();
  gallery.className = 'container portfolio-collection';
  var introduction = element('p', 'portfolio-intro open-sans-font', 'Explora mis áreas de trabajo. Selecciona una categoría para ver sus proyectos.');
  var filters = element('div', 'portfolio-filters');
  filters.setAttribute('role', 'group');
  filters.setAttribute('aria-label', 'Filtrar proyectos por categoría');
  var status = element('p', 'portfolio-status open-sans-font', '6 categorías · 36 imágenes provisionales');
  status.setAttribute('role', 'status');
  var content = element('div', 'portfolio-sections');
  content.id = 'portfolio-sections';
  gallery.append(introduction, filters, status, content);

  var sections = [];
  var filterButtons = [];
  function addFilter(id, label) {
    var button = element('button', 'portfolio-filter poppins-font', label);
    button.type = 'button';
    button.setAttribute('aria-pressed', id === 'all' ? 'true' : 'false');
    button.setAttribute('aria-controls', content.id);
    button.addEventListener('click', function () {
      filterButtons.forEach(function (filter) {
        filter.button.setAttribute('aria-pressed', filter.id === id ? 'true' : 'false');
      });
      sections.forEach(function (section) {
        section.node.hidden = id !== 'all' && section.id !== id;
      });
      status.textContent = id === 'all' ? '6 categorías · 36 imágenes provisionales' : label + ' · 6 imágenes provisionales';
    });
    filters.appendChild(button);
    filterButtons.push({ id: id, button: button });
  }
  addFilter('all', 'Todas');

  var viewer = element('dialog', 'portfolio-viewer');
  viewer.setAttribute('aria-labelledby', 'portfolio-viewer-title');
  var close = element('button', 'portfolio-viewer-close', 'Cerrar ×');
  close.type = 'button';
  var viewerTitle = element('h3', 'poppins-font');
  viewerTitle.id = 'portfolio-viewer-title';
  var viewerImage = element('img', 'portfolio-viewer-image');
  var previous = element('button', 'portfolio-viewer-arrow', '← Anterior');
  var next = element('button', 'portfolio-viewer-arrow', 'Siguiente →');
  previous.type = next.type = 'button';
  var counter = element('span', 'portfolio-viewer-counter');
  counter.setAttribute('aria-live', 'polite');
  var viewerNavigation = element('div', 'portfolio-viewer-navigation');
  viewerNavigation.append(previous, counter, next);
  viewer.append(close, viewerTitle, viewerImage, viewerNavigation);
  document.body.appendChild(viewer);
  var activeCategory;
  var activeIndex = 0;

  function updateViewer() {
    viewerTitle.textContent = activeCategory.title;
    viewerImage.src = activeCategory.images[activeIndex];
    viewerImage.alt = activeCategory.title + ' — Imagen ' + (activeIndex + 1) + ' (provisional)';
    counter.textContent = (activeIndex + 1) + ' / ' + activeCategory.images.length;
  }
  function moveImage(direction) {
    activeIndex = (activeIndex + direction + activeCategory.images.length) % activeCategory.images.length;
    updateViewer();
  }
  close.addEventListener('click', function () { viewer.close(); });
  previous.addEventListener('click', function () { moveImage(-1); });
  next.addEventListener('click', function () { moveImage(1); });
  viewer.addEventListener('click', function (event) {
    if (event.target !== viewer) return;
    var bounds = viewer.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) viewer.close();
  });
  viewer.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      moveImage(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });

  categories.forEach(function (category, categoryIndex) {
    addFilter(category.id, category.title);
    var section = element('section', 'portfolio-category');
    section.setAttribute('aria-labelledby', 'portfolio-heading-' + category.id);
    var headingRow = element('div', 'portfolio-category-heading');
    var heading = element('h3', 'poppins-font');
    heading.id = 'portfolio-heading-' + category.id;
    var icon = element('i', 'fa ' + category.icon);
    icon.setAttribute('aria-hidden', 'true');
    heading.append(icon, document.createTextNode(category.title));
    headingRow.append(heading, element('span', 'portfolio-category-count open-sans-font', '06 imágenes'));
    var grid = element('div', 'portfolio-photo-grid');
    category.images.forEach(function (source, index) {
      var card = element('button', 'portfolio-photo');
      card.type = 'button';
      card.setAttribute('aria-label', 'Ampliar ' + category.title + ', imagen ' + (index + 1) + ' (provisional)');
      card.setAttribute('aria-haspopup', 'dialog');
      var image = element('img');
      image.src = source;
      image.alt = category.title + ' — Imagen provisional ' + (index + 1);
      image.loading = categoryIndex === 0 ? 'eager' : 'lazy';
      image.width = 900;
      image.height = 650;
      var caption = element('span', 'portfolio-photo-caption');
      caption.append(element('span', 'open-sans-font', category.title), element('span', 'portfolio-photo-number', ('0' + (index + 1)).slice(-2)));
      card.append(image, caption);
      card.addEventListener('click', function () {
        activeCategory = category;
        activeIndex = index;
        updateViewer();
        viewer.showModal();
      });
      grid.appendChild(card);
    });
    section.append(headingRow, grid);
    content.appendChild(section);
    sections.push({ id: category.id, node: section });
  });
})();
