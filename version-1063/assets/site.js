(function() {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  ready(function() {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (mobileToggle && mobileNav) {
      mobileToggle.addEventListener('click', function() {
        mobileNav.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-global-search-form]').forEach(function(form) {
      form.addEventListener('submit', function(event) {
        var input = form.querySelector('[data-global-search-input]');
        if (!input) {
          return;
        }
        var query = input.value.trim();
        if (!query && form.getAttribute('action') === './search.html') {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var activeIndex = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
      }

      function startTimer() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function() {
          showSlide(activeIndex + 1);
        }, 5600);
      }

      dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
          showSlide(parseInt(dot.getAttribute('data-hero-dot'), 10));
          startTimer();
        });
      });

      if (prev) {
        prev.addEventListener('click', function() {
          showSlide(activeIndex - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener('click', function() {
          showSlide(activeIndex + 1);
          startTimer();
        });
      }

      showSlide(0);
      startTimer();
    }

    var cardSearch = document.querySelector('[data-card-search]');
    var yearFilter = document.querySelector('[data-filter-year]');
    var typeFilter = document.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-meta]'));

    function applyCardFilters() {
      var query = normalize(cardSearch ? cardSearch.value : '');
      var selectedYear = normalize(yearFilter ? yearFilter.value : '');
      var selectedType = normalize(typeFilter ? typeFilter.value : '');
      cards.forEach(function(card) {
        var meta = normalize(card.getAttribute('data-meta'));
        var year = normalize(card.getAttribute('data-year'));
        var type = normalize(card.getAttribute('data-type'));
        var matched = true;
        if (query && meta.indexOf(query) === -1) {
          matched = false;
        }
        if (selectedYear && year !== selectedYear) {
          matched = false;
        }
        if (selectedType && type !== selectedType) {
          matched = false;
        }
        card.classList.toggle('is-filtered-out', !matched);
      });
    }

    if (cardSearch) {
      cardSearch.addEventListener('input', applyCardFilters);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', applyCardFilters);
    }
    if (typeFilter) {
      typeFilter.addEventListener('change', applyCardFilters);
    }

    var searchResults = document.getElementById('search-results');
    var searchNote = document.getElementById('search-note');
    if (searchResults && window.SEARCH_INDEX) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q') || '';
      document.querySelectorAll('[data-global-search-input]').forEach(function(input) {
        input.value = q;
      });
      renderSearch(q);
    }

    function renderSearch(query) {
      var q = normalize(query);
      if (!searchResults) {
        return;
      }
      searchResults.innerHTML = '';
      if (!q) {
        if (searchNote) {
          searchNote.textContent = '输入关键词即可开始搜索。';
        }
        return;
      }
      var items = window.SEARCH_INDEX.filter(function(item) {
        return normalize(item.meta).indexOf(q) !== -1;
      }).slice(0, 96);
      if (searchNote) {
        searchNote.textContent = items.length ? '为你呈现相关影片。' : '暂无匹配内容。';
      }
      items.forEach(function(item) {
        var tags = (item.tags || []).slice(0, 3).map(function(tag) {
          return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        var html = '' +
          '<article class="movie-card">' +
            '<a href="' + escapeHtml(item.url) + '" class="movie-card-link">' +
              '<div class="poster-wrap">' +
                '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                '<span class="poster-type">' + escapeHtml(item.type) + '</span>' +
              '</div>' +
              '<div class="movie-card-body">' +
                '<div class="movie-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + '</div>' +
                '<h3>' + escapeHtml(item.title) + '</h3>' +
                '<p>' + escapeHtml(item.oneLine) + '</p>' +
                '<div class="tag-row">' + tags + '</div>' +
              '</div>' +
            '</a>' +
          '</article>';
        searchResults.insertAdjacentHTML('beforeend', html);
      });
    }

    function escapeHtml(value) {
      return (value || '').toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  });
})();
