(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(text) {
        return (text || '').toString().trim().toLowerCase();
    }

    function setupMobileNav() {
        var button = qs('.mobile-toggle');
        var panel = qs('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            panel.hidden = expanded;
            button.textContent = expanded ? '☰' : '×';
        });
    }

    function setupHero() {
        var hero = qs('[data-hero-slider]');
        if (!hero) {
            return;
        }
        var slides = qsa('.hero-slide', hero);
        var dots = qsa('.hero-dot', hero);
        var prev = qs('.hero-prev', hero);
        var next = qs('.hero-next', hero);
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                play();
            });
        });
        show(0);
        play();
    }

    function setupLocalFilters() {
        var scopes = qsa('[data-filter-scope]');
        scopes.forEach(function (scope) {
            var input = qs('[data-local-search]', scope);
            var region = qs('[data-region-filter]', scope);
            var year = qs('[data-year-filter]', scope);
            var grid = scope.nextElementSibling;
            while (grid && !grid.classList.contains('movie-grid')) {
                grid = grid.nextElementSibling;
            }
            if (!grid) {
                return;
            }
            var cards = qsa('[data-search-card]', grid);
            var noResults = grid.nextElementSibling;
            function filter() {
                var keyword = normalize(input && input.value);
                var regionValue = normalize(region && region.value);
                var yearValue = normalize(year && year.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags,
                        card.textContent
                    ].join(' '));
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchRegion = !regionValue || normalize(card.dataset.region) === regionValue;
                    var matchYear = !yearValue || normalize(card.dataset.year) === yearValue;
                    var ok = matchKeyword && matchRegion && matchYear;
                    card.style.display = ok ? '' : 'none';
                    if (ok) {
                        visible += 1;
                    }
                });
                if (noResults && noResults.classList.contains('no-results')) {
                    noResults.classList.toggle('is-visible', visible === 0);
                }
            }
            [input, region, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', filter);
                    control.addEventListener('change', filter);
                }
            });
            filter();
        });
    }

    function setupSearchQuery() {
        var page = qs('[data-search-page]');
        if (!page) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        var input = qs('[data-local-search]', page) || qs('[data-local-search]');
        if (input && q) {
            input.value = q;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    window.setupMoviePlayer = function (id, source) {
        var video = document.getElementById(id);
        if (!video || !source) {
            return;
        }
        var box = video.closest('.video-box');
        var overlay = box ? qs('.player-overlay', box) : null;
        var hls = null;
        var ready = false;

        function bind() {
            if (ready) {
                return Promise.resolve();
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                return new Promise(function (resolve) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            try {
                                hls.destroy();
                            } catch (error) {}
                            hls = null;
                            ready = false;
                        }
                    });
                    setTimeout(resolve, 1600);
                });
            }
            video.src = source;
            return Promise.resolve();
        }

        function start() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            bind().then(function () {
                var attempt = video.play();
                if (attempt && attempt.catch) {
                    attempt.catch(function () {
                        if (overlay) {
                            overlay.classList.remove('is-hidden');
                        }
                    });
                }
            });
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNav();
        setupHero();
        setupLocalFilters();
        setupSearchQuery();
    });
})();
