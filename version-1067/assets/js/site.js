(function () {
    const navToggle = document.querySelector("[data-nav-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (navToggle && mobileNav) {
        navToggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    let slideIndex = 0;

    function setSlide(nextIndex) {
        if (!slides.length) {
            return;
        }
        slideIndex = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, index) {
            slide.classList.toggle("active", index === slideIndex);
        });
        dots.forEach(function (dot, index) {
            dot.classList.toggle("active", index === slideIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            setSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            setSlide(slideIndex + 1);
        }, 6200);
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function filterCards(query) {
        const normalized = normalize(query);
        const lists = Array.from(document.querySelectorAll("[data-filterable-list]"));
        let anyMatched = false;
        lists.forEach(function (list) {
            const cards = Array.from(list.querySelectorAll(".movie-card, .rank-row"));
            cards.forEach(function (card) {
                const haystack = normalize(card.getAttribute("data-search") || card.textContent);
                const matched = !normalized || haystack.indexOf(normalized) !== -1;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    anyMatched = true;
                }
            });
        });
        const empty = document.querySelector("[data-empty-result]");
        if (empty) {
            empty.classList.toggle("is-visible", lists.length > 0 && !anyMatched);
        }
    }

    const localInputs = Array.from(document.querySelectorAll("[data-live-search]"));
    localInputs.forEach(function (input) {
        input.addEventListener("input", function () {
            filterCards(input.value);
        });
    });

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";
    if (initialQuery) {
        localInputs.forEach(function (input) {
            input.value = initialQuery;
        });
        filterCards(initialQuery);
    }

    const siteForms = Array.from(document.querySelectorAll("[data-site-search]"));
    siteForms.forEach(function (form) {
        form.addEventListener("submit", function (event) {
            const input = form.querySelector("input[name='q']");
            const value = input ? input.value.trim() : "";
            if (!value) {
                return;
            }
            if (document.body.classList.contains("search-page")) {
                event.preventDefault();
                localInputs.forEach(function (localInput) {
                    localInput.value = value;
                });
                filterCards(value);
                history.replaceState(null, "", "./search.html?q=" + encodeURIComponent(value));
            }
        });
    });
})();
