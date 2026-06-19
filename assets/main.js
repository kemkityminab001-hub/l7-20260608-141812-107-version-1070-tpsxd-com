(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector('.menu-toggle');
        var nav = document.querySelector('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initImages() {
        document.querySelectorAll('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('image-hidden');
            });
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero-slider]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
        var prev = root.querySelector('.hero-prev');
        var next = root.querySelector('.hero-next');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-go') || 0));
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        if (slides.length > 1) {
            start();
        }
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function textOfCard(card) {
        return normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-tags')
        ].join(' '));
    }

    function initSearch() {
        var grid = document.querySelector('[data-search-grid]');
        if (!grid) {
            return;
        }
        var queryInput = document.getElementById('site-search');
        var yearSelect = document.getElementById('year-filter');
        var typeSelect = document.getElementById('type-filter');
        var clearButton = document.getElementById('clear-filter');
        var count = document.getElementById('result-count');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

        function apply() {
            var query = normalize(queryInput && queryInput.value);
            var year = normalize(yearSelect && yearSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var visible = 0;
            cards.forEach(function (card) {
                var text = textOfCard(card);
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
                var matchType = !type || normalize(card.getAttribute('data-type')) === type;
                var show = matchQuery && matchYear && matchType;
                card.classList.toggle('is-hidden', !show);
                if (show) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = String(visible);
            }
        }

        [queryInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        if (clearButton) {
            clearButton.addEventListener('click', function () {
                if (queryInput) {
                    queryInput.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                apply();
            });
        }
    }

    function initLocalFilter() {
        var input = document.querySelector('.local-filter');
        var scope = document.querySelector('[data-filter-scope]');
        if (!input || !scope) {
            return;
        }
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        input.addEventListener('input', function () {
            var query = normalize(input.value);
            cards.forEach(function (card) {
                var show = !query || textOfCard(card).indexOf(query) !== -1;
                card.classList.toggle('is-hidden', !show);
            });
        });
    }

    ready(function () {
        initMenu();
        initImages();
        initHero();
        initSearch();
        initLocalFilter();
    });
})();
