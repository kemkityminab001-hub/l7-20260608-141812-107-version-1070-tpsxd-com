(function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    let activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  const homeSearch = document.querySelector("[data-home-search]");
  if (homeSearch) {
    homeSearch.addEventListener("submit", function (event) {
      event.preventDefault();
      const input = homeSearch.querySelector("input[name='q']");
      const query = input ? input.value.trim() : "";
      const target = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
      window.location.href = target;
    });
  }

  const filterForm = document.querySelector("[data-filter-form]");
  const grid = document.querySelector("[data-filter-grid]");
  if (filterForm && grid) {
    const keywordInput = filterForm.querySelector("[data-filter-keyword]");
    const yearSelect = filterForm.querySelector("[data-filter-year]");
    const typeSelect = filterForm.querySelector("[data-filter-type]");
    const empty = document.querySelector("[data-filter-empty]");
    const cards = Array.from(grid.querySelectorAll(".movie-card"));

    function applyFilter() {
      const keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
      const year = yearSelect ? yearSelect.value : "";
      const type = typeSelect ? typeSelect.value : "";
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        const matchKeyword = !keyword || haystack.includes(keyword);
        const matchYear = !year || card.getAttribute("data-year") === year;
        const matchType = !type || card.getAttribute("data-type") === type;
        const show = matchKeyword && matchYear && matchType;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    const params = new URLSearchParams(window.location.search);
    const initialKeyword = params.get("q");
    if (initialKeyword && keywordInput) {
      keywordInput.value = initialKeyword;
    }

    filterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilter();
    });

    [keywordInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  }

  const video = document.getElementById("movie-video");
  const playerShell = document.querySelector(".player-shell");
  const playerCover = document.querySelector(".player-cover");
  if (video && playerShell && window.__videoPlaylist) {
    let initialized = false;

    function attachVideo() {
      if (initialized) {
        return;
      }
      initialized = true;
      const url = window.__videoPlaylist;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function startVideo() {
      attachVideo();
      playerShell.classList.add("is-playing");
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (playerCover) {
      playerCover.addEventListener("click", startVideo);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startVideo();
      }
    });
  }
})();
