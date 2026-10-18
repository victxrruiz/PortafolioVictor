(function () {
  'use strict';

  var gallery = document.getElementById('grid-gallery');
  if (!gallery) return;

  // Agrega las rutas de tus proyectos a las imágenes de cada categoría.
  var categories = [
    {
      id: 'social-media', title: 'Social Media', icon: 'fa-comments',
      images: [
        'img/portfolio/social-media/01.jpg', 'img/portfolio/social-media/02.jpg',
        'img/portfolio/social-media/03.jpg', 'img/portfolio/social-media/04.jpg',
        'img/portfolio/social-media/05.jpg', 'img/portfolio/social-media/06.jpg',
        'img/portfolio/social-media/07.jpg', 'img/portfolio/social-media/08.jpg'
      ],
      thumbnails: [
        'img/portfolio/social-media/01-thumb.jpg', 'img/portfolio/social-media/02-thumb.jpg',
        'img/portfolio/social-media/03-thumb.jpg', 'img/portfolio/social-media/04-thumb.jpg',
        'img/portfolio/social-media/05-thumb.jpg', 'img/portfolio/social-media/06-thumb.jpg',
        'img/portfolio/social-media/07-thumb.jpg', 'img/portfolio/social-media/08-thumb.jpg'
      ]
    },
    {
      id: 'editorial', title: 'Editorial', icon: 'fa-book',
      images: [
        'img/portfolio/editorial/01.jpg', 'img/portfolio/editorial/02.jpg',
        'img/portfolio/editorial/03.jpg', 'img/portfolio/editorial/04.jpg',
        'img/portfolio/editorial/05.jpg', 'img/portfolio/editorial/06.jpg',
        'img/portfolio/editorial/07.jpg', 'img/portfolio/editorial/08.jpg'
      ],
      thumbnails: [
        'img/portfolio/editorial/01-thumb.jpg', 'img/portfolio/editorial/02-thumb.jpg',
        'img/portfolio/editorial/03-thumb.jpg', 'img/portfolio/editorial/04-thumb.jpg',
        'img/portfolio/editorial/05-thumb.jpg', 'img/portfolio/editorial/06-thumb.jpg',
        'img/portfolio/editorial/07-thumb.jpg', 'img/portfolio/editorial/08-thumb.jpg'
      ]
    },
    { id: 'branding', title: 'Marca / Branding', icon: 'fa-pencil', images: [] },
    {
      id: 'escenografia', title: 'Escenografía / Stands', icon: 'fa-cubes',
      images: [
        'img/portfolio/escenografia/01.jpg', 'img/portfolio/escenografia/02.png',
        'img/portfolio/escenografia/03.png'
      ],
      thumbnails: [
        'img/portfolio/escenografia/01-thumb.jpg', 'img/portfolio/escenografia/02-thumb.png',
        'img/portfolio/escenografia/03-thumb.png'
      ]
    },
    { id: 'espacios', title: 'Intervención de espacios', icon: 'fa-building-o', images: [] },
    { id: 'fotografia', title: 'Fotografía', icon: 'fa-camera', images: [] }
  ];

  function imageSummary(images) {
    return images.length + ' imágenes';
  }
  var allImages = categories.reduce(function (images, category) { return images.concat(category.images); }, []);
  var allSummary = categories.length + ' categorías · ' + imageSummary(allImages);

  function imageDescription(category, index) {
    return category.title + ' — Imagen ' + (index + 1);
  }

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
  var status = element('p', 'portfolio-status open-sans-font', allSummary);
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
      var selectedCategory = categories.find(function (category) { return category.id === id; });
      status.textContent = id === 'all' ? allSummary : label + ' · ' + imageSummary(selectedCategory.images);
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
    viewerImage.alt = imageDescription(activeCategory, activeIndex);
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
    headingRow.append(heading, element('span', 'portfolio-category-count open-sans-font', ('0' + category.images.length).slice(-2) + ' imágenes'));
    var grid = element('div', 'portfolio-photo-grid');
    if (!category.images.length) {
      section.append(headingRow, element('p', 'portfolio-intro open-sans-font', 'Aún no hay proyectos publicados en esta sección.'));
      content.appendChild(section);
      sections.push({ id: category.id, node: section });
      return;
    }
    category.images.forEach(function (source, index) {
      var card = element('button', 'portfolio-photo');
      card.type = 'button';
      card.setAttribute('aria-label', 'Ampliar ' + imageDescription(category, index));
      card.setAttribute('aria-haspopup', 'dialog');
      var image = element('img');
      image.src = category.thumbnails ? category.thumbnails[index] : source;
      image.alt = imageDescription(category, index);
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
