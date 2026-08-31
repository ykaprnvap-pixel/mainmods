/* Moped24 — страница товара: карточка по ?id=, характеристики, похожие модели. */
(function () {
  'use strict';

  var M24 = window.M24;

  function renderProduct(product, data) {
    var esc = M24.escape;
    var category = data.categoryById[product.category] || {};

    document.title = product.name + ' — купить в Красноярске | Moped24';
    var meta = M24.qs('meta[name="description"]');
    if (meta && product.summary) meta.setAttribute('content', product.summary + ' Мотосалон Moped24, Красноярск.');

    M24.qs('[data-product-crumb]').textContent = product.name;
    var catCrumb = M24.qs('[data-product-crumb-category]');
    catCrumb.textContent = category.title || 'Каталог';
    catCrumb.href = M24.base() + 'catalog/?type=' + encodeURIComponent(product.category);

    M24.qs('[data-product-title]').textContent = product.name;
    M24.qs('[data-product-summary]').textContent = product.summary || '';

    var image = M24.qs('[data-product-image]');
    image.src = M24.imageUrl(product.image);
    image.alt = product.name;

    M24.qs('[data-product-price]').innerHTML = '<b>' + M24.price(product.price) + '</b>' +
      (product.oldPrice ? '<s>' + M24.price(product.oldPrice) + '</s>' : '') +
      '<span class="muted">Цена действительна при покупке в салоне</span>';

    M24.qs('[data-product-meta]').innerHTML = (product.inStock
        ? '<span class="badge badge--stock">В наличии в салоне</span>'
        : '<span class="badge badge--order">Под заказ, срок уточняйте</span>') +
      (product.hit ? '<span class="badge badge--hit">Хит продаж</span>' : '') +
      '<span class="muted">Артикул: ' + esc(product.id) + '</span>';

    var rows = Object.keys(product.specs || {}).map(function (key) {
      return '<tr><th scope="row">' + esc(key) + '</th><td>' + esc(product.specs[key]) + '</td></tr>';
    }).join('');
    M24.qs('[data-product-specs]').innerHTML = rows ||
      '<tr><td>Характеристики уточняйте у менеджера.</td></tr>';

    var installment = Math.round(product.price / 12 / 100) * 100;
    M24.qs('[data-product-installment]').textContent =
      'Ориентировочный платёж — около ' + M24.price(installment) + ' в месяц при рассрочке на 12 месяцев. ' +
      'Точные условия называет банк после одобрения.';

    var similar = data.products.filter(function (p) {
      return p.category === product.category && p.id !== product.id;
    }).slice(0, 4);
    var similarBlock = M24.qs('[data-product-similar-block]');
    if (similar.length) {
      M24.qs('[data-product-similar]').innerHTML = similar.map(function (p) {
        return M24.card(p, (data.categoryById[p.category] || {}).title);
      }).join('');
    } else {
      similarBlock.hidden = true;
    }

    var jsonLd = document.createElement('script');
    jsonLd.type = 'application/ld+json';
    jsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.summary,
      category: category.title,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'RUB',
        availability: product.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/PreOrder',
        seller: { '@type': 'Organization', name: 'Moped24' }
      }
    });
    document.head.appendChild(jsonLd);
  }

  function renderMissing() {
    var main = M24.qs('[data-product-root]');
    main.innerHTML = '<div class="empty">' +
      '<h1>Модель не найдена</h1>' +
      '<p class="muted">Возможно, она уже продана или ссылка устарела. Посмотрите каталог или позвоните нам.</p>' +
      '<p class="wrap-cta" style="justify-content:center">' +
        '<a class="btn btn--primary" href="' + M24.base() + 'catalog/">В каталог</a>' +
        '<a class="btn btn--light" href="tel:+73912883868">8 (391) 288-38-68</a>' +
      '</p></div>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!M24.qs('[data-product-root]')) return;
    var id = new URLSearchParams(window.location.search).get('id');

    M24.catalog().then(function (data) {
      var product = data.products.filter(function (p) { return p.id === id; })[0];
      if (!product) return renderMissing();
      renderProduct(product, data);
    }).catch(renderMissing);
  });
})();
