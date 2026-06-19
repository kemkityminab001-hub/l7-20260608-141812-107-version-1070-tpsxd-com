document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var target = form.getAttribute("data-search-target") || form.getAttribute("action") || "./search.html";
      var keyword = input ? input.value.trim() : "";
      var url = target + (keyword ? "?q=" + encodeURIComponent(keyword) : "");
      window.location.href = url;
    });
  });

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
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

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  var filterInput = document.querySelector("[data-filter-input]");
  var filterType = document.querySelector("[data-filter-type]");
  var filterYear = document.querySelector("[data-filter-year]");
  var filterRegion = document.querySelector("[data-filter-region]");
  var filterCount = document.querySelector("[data-filter-count]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var empty = document.querySelector("[data-empty-state]");

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilter() {
    if (!cards.length) {
      return;
    }
    var keyword = normalize(filterInput ? filterInput.value : "");
    var type = normalize(filterType ? filterType.value : "");
    var year = normalize(filterYear ? filterYear.value : "");
    var region = normalize(filterRegion ? filterRegion.value : "");
    var shown = 0;

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" "));
      var ok = true;
      ok = ok && (!keyword || text.indexOf(keyword) !== -1);
      ok = ok && (!type || normalize(card.getAttribute("data-type")).indexOf(type) !== -1 || text.indexOf(type) !== -1);
      ok = ok && (!year || normalize(card.getAttribute("data-year")).indexOf(year) !== -1);
      ok = ok && (!region || normalize(card.getAttribute("data-region")).indexOf(region) !== -1 || text.indexOf(region) !== -1);
      card.style.display = ok ? "" : "none";
      if (ok) {
        shown += 1;
      }
    });

    if (filterCount) {
      filterCount.textContent = shown + " 部";
    }
    if (empty) {
      empty.style.display = shown ? "none" : "block";
    }
  }

  if (filterInput || filterType || filterYear || filterRegion) {
    var q = getParam("q");
    if (q && filterInput) {
      filterInput.value = q;
    }
    [filterInput, filterType, filterYear, filterRegion].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
    applyFilter();
  }
});
