/* Moped24 — каталог: фильтры, сортировка, поиск, состояние в адресной строке. */
(function () {
  'use strict';

  var M24 = window.M24;
  var state = { types: [], stock: false, query: '', min: null, max: null, sort: 'popular' };

  var els = {};

  function readUrl() {
    var params = new URLSearchParams(window.location.search);
    var type = params.get('type');
    state.types = type ? type.split(',').filter(Boolean) : [];
    state.stock = params.get('stock') === '1';
    state.query = params.get('q') || '';
    state.min = params.get('min') ? Number(params.get('min')) : null;
    state.max = params.get('max') ? Number(params.get('max')) : null;
    state.sort = params.get('sort') || 'popular';
  }

  function writeUrl() {
    var params = new URLSearchParams();
    if (state.types.length) params.set('type', state.types.join(','));
    if (state.stock) params.set('stock', '1');
    if (state.query) params.set('q', state.query);
    if (state.min != null) params.set('min', String(state.min));
    if (state.max != null) params.set('max', String(state.max));
    if (state.sort !== 'popular') params.set('sort', state.sort);
    var qs = params.toString();
    history.replaceState(null, '', qs ? '?' + qs : window.location.pathname);
  }

  function matches(product) {
    if (state.types.length && state.types.indexOf(product.category) === -1) return false;
    if (state.stock && !product.inStock) return false;
    if (state.min != null && product.price < state.min) return false;
    if (state.max != null && product.price > state.max) return false;
    if (state.query) {
      var haystack = (product.name + ' ' + (product.summary || '')).toLowerCase();
      if (haystack.indexOf(state.query.toLowerCase().trim()) === -1) return false;
    }
    return true;
  }

  var SORTERS = {
    'popular': function (a, b) { return (b.hit - a.hit) || (b.inStock - a.inStock) || a.name.localeCompare(b.name, 'ru'); },
    'price-asc': function (a, b) { return a.price - b.price; },
    'price-desc': function (a, b) { return b.price - a.price; },
    'name': function (a, b) { return a.name.localeCompare(b.name, 'ru'); }
  };

  function plural(count, one, few, many) {
    var mod10 = count % 10, mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  }

  function render(data) {
    var items = data.products.filter(matches).sort(SORTERS[state.sort] || SORTERS.popular);

    els.grid.innerHTML = items.map(function (p) {
      return M24.card(p, (data.categoryById[p.category] || {}).title);
    }).join('');

    els.count.textContent = items.length
      ? 'Найдено ' + items.length + ' ' + plural(items.length, 'модель', 'модели', 'моделей')
      : '';
    els.empty.hidden = items.length > 0;
    els.reset.hidden = !(state.types.length || state.stock || state.query || state.min != null || state.max != null);
    writeUrl();
  }

  function buildFilters(data) {
    els.types.innerHTML = data.categories.map(function (cat) {
      var checked = state.types.indexOf(cat.id) !== -1 ? ' checked' : '';
      return '<label class="check"><input type="checkbox" value="' + M24.escape(cat.id) + '"' + checked + '> ' +
        M24.escape(cat.title) + '</label>';
    }).join('');

    els.stock.checked = state.stock;
    els.search.value = state.query;
    els.sort.value = state.sort;
    els.min.value = state.min == null ? '' : state.min;
    els.max.value = state.max == null ? '' : state.max;
  }

  function bind(data) {
    els.types.addEventListener('change', function () {
      state.types = M24.qsa('input:checked', els.types).map(function (input) { return input.value; });
      render(data);
    });

    els.stock.addEventListener('change', function () {
      state.stock = els.stock.checked;
      render(data);
    });

    els.sort.addEventListener('change', function () {
      state.sort = els.sort.value;
      render(data);
    });

    var searchTimer;
    els.search.addEventListener('input', function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        state.query = els.search.value;
        render(data);
      }, 200);
    });

    [els.min, els.max].forEach(function (input) {
      input.addEventListener('change', function () {
        var value = input.value.trim() === '' ? null : Number(input.value);
        state[input === els.min ? 'min' : 'max'] = (value == null || isNaN(value)) ? null : value;
        render(data);
      });
    });

    els.reset.addEventListener('click', function () {
      state = { types: [], stock: false, query: '', min: null, max: null, sort: state.sort };
      buildFilters(data);
      render(data);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    els.grid = M24.qs('[data-catalog-grid]');
    if (!els.grid) return;

    els.types = M24.qs('[data-filter-types]');
    els.stock = M24.qs('[data-filter-stock]');
    els.search = M24.qs('[data-filter-search]');
    els.sort = M24.qs('[data-filter-sort]');
    els.min = M24.qs('[data-filter-min]');
    els.max = M24.qs('[data-filter-max]');
    els.count = M24.qs('[data-catalog-count]');
    els.empty = M24.qs('[data-catalog-empty]');
    els.reset = M24.qs('[data-filter-reset]');

    readUrl();

    M24.catalog().then(function (data) {
      buildFilters(data);
      bind(data);
      render(data);
    }).catch(function () {
      els.grid.innerHTML = '';
      els.empty.hidden = false;
      els.empty.innerHTML = '<h2>Каталог не загрузился</h2>' +
        '<p class="muted">Обновите страницу или позвоните нам — расскажем, что есть в наличии: ' +
        '<a href="tel:+73912883868">8 (391) 288-38-68</a>.</p>';
    });
  });
})();
