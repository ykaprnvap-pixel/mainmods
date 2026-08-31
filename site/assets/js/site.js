/* Moped24 — общие скрипты сайта: меню, аккордеон, формы, данные каталога. */
(function () {
  'use strict';

  var M24 = window.M24 = {};

  /* ---------- утилиты ---------- */

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  M24.qs = qs;
  M24.qsa = qsa;

  /** Базовый путь до корня сайта — берётся из data-base на <body>. */
  M24.base = function () {
    return (document.body && document.body.dataset.base) || './';
  };

  M24.escape = function (value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  /** 289000 → «289 000 ₽» (неразрывные пробелы, чтобы цена не рвалась по строкам). */
  M24.price = function (value) {
    if (value == null) return 'по запросу';
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
  };

  /* ---------- данные каталога ---------- */

  var catalogPromise = null;

  /** Загружает products.json один раз за страницу. */
  M24.catalog = function () {
    if (!catalogPromise) {
      catalogPromise = fetch(M24.base() + 'assets/data/products.json', { cache: 'no-cache' })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (data) {
          data.categoryById = {};
          data.categories.forEach(function (cat) { data.categoryById[cat.id] = cat; });
          return data;
        });
    }
    return catalogPromise;
  };

  M24.productUrl = function (product) {
    return M24.base() + 'catalog/product.html?id=' + encodeURIComponent(product.id);
  };

  M24.imageUrl = function (name) {
    return M24.base() + 'assets/img/' + name;
  };

  /** Разметка карточки товара — общая для главной, каталога и блока «похожие». */
  M24.card = function (product, categoryTitle) {
    var esc = M24.escape;
    var url = M24.productUrl(product);
    var stock = product.inStock
      ? '<span class="badge badge--stock">В наличии</span>'
      : '<span class="badge badge--order">Под заказ</span>';
    var hit = product.hit ? '<span class="badge badge--hit">Хит</span>' : '';
    var old = product.oldPrice ? '<s>' + M24.price(product.oldPrice) + '</s>' : '';

    return '' +
      '<article class="card">' +
        '<div class="card__media">' +
          stock + hit +
          '<img src="' + esc(M24.imageUrl(product.image)) + '" alt="' + esc(product.name) + '" loading="lazy" width="320" height="200">' +
        '</div>' +
        '<div class="card__body">' +
          '<h3 class="card__title"><a href="' + esc(url) + '">' + esc(product.name) + '</a></h3>' +
          '<p class="card__specs">' + esc(categoryTitle || '') + (product.engineCc ? ' · ' + product.engineCc + ' см³' : '') + '</p>' +
          '<div class="card__price"><b>' + M24.price(product.price) + '</b>' + old + '</div>' +
          '<div class="card__actions">' +
            '<a class="btn btn--primary btn--sm" href="' + esc(url) + '">Подробнее</a>' +
            '<a class="btn btn--light btn--sm" href="tel:+73912883868">Позвонить</a>' +
          '</div>' +
        '</div>' +
      '</article>';
  };

  /* ---------- мобильное меню ---------- */

  function initHeader() {
    var burger = qs('[data-burger]');
    var nav = qs('[data-nav]');
    if (!burger || !nav) return;

    function setOpen(open) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('is-open', open);
    }

    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        burger.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1060) setOpen(false);
    });
  }

  /* ---------- FAQ ---------- */

  function initFaq() {
    qsa('[data-faq] .faq__q').forEach(function (button) {
      var answer = document.getElementById(button.getAttribute('aria-controls'));
      if (!answer) return;
      button.addEventListener('click', function () {
        var expanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        answer.hidden = expanded;
      });
    });
  }

  /* ---------- формы заявок ---------- */

  var PHONE_RE = /^[+\d][\d\s\-()]{9,}$/;

  function validateField(field) {
    var input = qs('input, select, textarea', field);
    var error = qs('.field__error', field);
    var message = '';

    if (input.required && !input.value.trim()) {
      message = 'Заполните это поле';
    } else if (input.type === 'tel' && input.value.trim() && !PHONE_RE.test(input.value.trim())) {
      message = 'Укажите телефон в формате +7 999 123-45-67';
    }

    field.classList.toggle('is-invalid', Boolean(message));
    if (error) error.textContent = message;
    return !message;
  }

  function initForms() {
    qsa('[data-form]').forEach(function (form) {
      var fields = qsa('.field', form);
      var status = qs('[data-form-status]', form);

      fields.forEach(function (field) {
        var input = qs('input, select, textarea', field);
        if (!input) return;
        input.addEventListener('blur', function () { validateField(field); });
        input.addEventListener('input', function () {
          if (field.classList.contains('is-invalid')) validateField(field);
        });
      });

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var valid = fields.map(validateField).every(Boolean);
        if (!valid) {
          var firstInvalid = qs('.field.is-invalid input, .field.is-invalid select, .field.is-invalid textarea', form);
          if (firstInvalid) firstInvalid.focus();
          return;
        }

        // Бэкенда нет: собираем письмо на info@moped24.ru.
        // Точка интеграции с CRM описана в site/README.md.
        var data = new FormData(form);
        var lines = [];
        fields.forEach(function (field) {
          var input = qs('input, select, textarea', field);
          var label = qs('span', field);
          if (input && label && data.get(input.name)) {
            lines.push(label.textContent.replace('*', '').trim() + ': ' + data.get(input.name));
          }
        });

        var subject = form.dataset.subject || 'Заявка с сайта Moped24';
        var mailto = 'mailto:info@moped24.ru?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(lines.join('\n'));

        if (status) {
          status.hidden = false;
          status.innerHTML = 'Заявка подготовлена. Мы перезвоним в рабочее время (9:00–19:00). ' +
            'Можно также <a href="' + M24.escape(mailto) + '">отправить её письмом</a> или позвонить ' +
            '<a href="tel:+73912883868">8 (391) 288-38-68</a>.';
          status.setAttribute('tabindex', '-1');
          status.focus();
        }
        form.reset();
      });
    });
  }

  /* ---------- популярные модели на главной ---------- */

  function initFeatured() {
    var grid = qs('[data-featured]');
    if (!grid) return;
    var limit = Number(grid.dataset.featured) || 8;

    M24.catalog().then(function (data) {
      var items = data.products.filter(function (p) { return p.hit; });
      data.products.forEach(function (p) {
        if (items.length < limit && items.indexOf(p) === -1 && p.inStock) items.push(p);
      });
      grid.innerHTML = items.slice(0, limit).map(function (p) {
        return M24.card(p, (data.categoryById[p.category] || {}).title);
      }).join('');
    }).catch(function () {
      grid.innerHTML = '<p class="muted">Не удалось загрузить каталог. Позвоните нам — подскажем, что есть в наличии: ' +
        '<a href="tel:+73912883868">8 (391) 288-38-68</a>.</p>';
    });
  }

  /* ---------- плитки категорий ---------- */

  function initCategories() {
    var grid = qs('[data-categories]');
    if (!grid) return;

    M24.catalog().then(function (data) {
      grid.innerHTML = data.categories.map(function (cat) {
        var href = M24.base() + 'catalog/?type=' + encodeURIComponent(cat.id);
        return '' +
          '<a class="cat" href="' + M24.escape(href) + '">' +
            '<img class="cat__art" src="' + M24.escape(M24.imageUrl(cat.image)) + '" alt="" width="320" height="200" loading="lazy">' +
            '<h3>' + M24.escape(cat.title) + '</h3>' +
            '<p>' + M24.escape(cat.description) + '</p>' +
            '<span class="cat__more">Смотреть модели →</span>' +
          '</a>';
      }).join('');
    }).catch(function () {
      grid.innerHTML = '<p class="muted">Каталог временно недоступен. Позвоните: <a href="tel:+73912883868">8 (391) 288-38-68</a>.</p>';
    });
  }

  /* ---------- прочее ---------- */

  function initYear() {
    qsa('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initFaq();
    initForms();
    initFeatured();
    initCategories();
    initYear();
  });
})();
