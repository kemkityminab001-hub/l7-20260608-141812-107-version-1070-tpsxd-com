(function () {
    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            document.body.classList.toggle("is-menu-open", nav.classList.contains("is-open"));
        });
    }

    function setupHero() {
        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            if (slides.length < 2) {
                return;
            }
            var index = 0;
            var timer = null;
            function show(next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, pos) {
                    slide.classList.toggle("is-active", pos === index);
                });
                dots.forEach(function (dot, pos) {
                    dot.classList.toggle("is-active", pos === index);
                });
            }
            function start() {
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }
            dots.forEach(function (dot, pos) {
                dot.addEventListener("click", function () {
                    if (timer) {
                        window.clearInterval(timer);
                    }
                    show(pos);
                    start();
                });
            });
            start();
        });
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var items = Array.prototype.slice.call(scope.querySelectorAll("[data-search]"));
            var empty = scope.querySelector("[data-filter-empty]");
            if (!input || !items.length) {
                return;
            }
            input.addEventListener("input", function () {
                var query = input.value.trim().toLowerCase();
                var visible = 0;
                items.forEach(function (item) {
                    var haystack = (item.getAttribute("data-search") || "").toLowerCase();
                    var matched = !query || haystack.indexOf(query) !== -1;
                    item.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            });
        });
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.querySelector("[data-player-video]");
        var overlay = document.querySelector("[data-player-overlay]");
        var hlsInstance = null;
        var loaded = false;
        if (!video || !overlay || !streamUrl) {
            return;
        }
        function reveal() {
            overlay.classList.add("is-hidden");
            video.setAttribute("controls", "controls");
        }
        function restore() {
            overlay.classList.remove("is-hidden");
        }
        function attemptPlay() {
            reveal();
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    restore();
                });
            }
        }
        function load() {
            if (loaded) {
                attemptPlay();
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.addEventListener("loadedmetadata", attemptPlay, { once: true });
                attemptPlay();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, attemptPlay);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        restore();
                    }
                });
                return;
            }
            video.src = streamUrl;
            video.addEventListener("loadedmetadata", attemptPlay, { once: true });
            attemptPlay();
        }
        overlay.addEventListener("click", load);
        video.addEventListener("click", function () {
            if (video.paused) {
                load();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
