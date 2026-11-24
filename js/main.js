/* =====================================================================
   Fast Track International — main.js
   jQuery 3.7 · Bootstrap 5.3 · Swiper 11 (home page only)
   ===================================================================== */
(function ($) {
  "use strict";

  /* -------------------------------------------------------------------
     Site settings — edit these in one place
     ------------------------------------------------------------------- */
  var SETTINGS = {
    // Offer end date for the 70% OFF countdown (Asia/Dhaka time)
    offerEnds: "2026-12-31T23:59:59+06:00"
  };

  $(function () {
    var $win = $(window);
    var $nav = $(".site-nav");
    var $toTop = $("#toTop");

    /* ---------------- Active menu item (by <body data-page>) ---------------- */
    var page = $("body").data("page");
    if (page) {
      $('.site-nav [data-nav="' + page + '"]').addClass("active");
      if (page === "ielts" || page === "pte") {
        $('.site-nav [data-nav="courses"]').addClass("active");
      }
    }

    /* ---------------- Footer year ---------------- */
    $(".js-year").text(new Date().getFullYear());

    /* ---------------- Scroll reveal ---------------- */
    var $reveals = $(".reveal");
    function revealOnScroll() {
      if (!$reveals.length) return;
      var trigger = $win.scrollTop() + $win.height() * 0.9;
      $reveals = $reveals.filter(function () {
        var $el = $(this);
        if ($el.offset().top < trigger) {
          var delay = parseInt($el.data("delay"), 10) || 0;
          setTimeout(function () { $el.addClass("in"); }, delay);
          return false;
        }
        return true;
      });
    }

    /* ---------------- Scroll handler (rAF throttled) ---------------- */
    var ticking = false;
    function onScroll() {
      var y = $win.scrollTop();
      $nav.toggleClass("scrolled", y > 10);
      $toTop.toggleClass("show", y > 600);
      revealOnScroll();
      ticking = false;
    }
    $win.on("scroll resize", function () {
      if (!ticking) {
        ticking = true;
        (window.requestAnimationFrame || setTimeout)(onScroll);
      }
    });
    onScroll();

    /* ---------------- Back to top ---------------- */
    $toTop.on("click", function () {
      $("html, body").stop().animate({ scrollTop: 0 }, 650, "swing");
    });

    /* ---------------- Smooth in-page anchors ---------------- */
    $('a[href^="#"]').not('[data-bs-toggle]').on("click", function (e) {
      var target = $(this).attr("href");
      if (target.length < 2 || !$(target).length) return;
      e.preventDefault();
      $("html, body").stop().animate({ scrollTop: $(target).offset().top - ($nav.outerHeight() || 70) }, 650, "swing");
    });

    /* ---------------- External links → new tab ---------------- */
    $('a[href^="http"]').filter(function () {
      return this.hostname && this.hostname !== location.hostname;
    }).attr({ target: "_blank", rel: "noopener noreferrer" });

    /* ---------------- Video modal (Bootstrap) ---------------- */
    var $videoModal = $("#videoModal");
    if ($videoModal.length) {
      var $frame = $videoModal.find("iframe");
      $videoModal.on("show.bs.modal", function (e) {
        var id = $(e.relatedTarget).data("video") || $frame.data("video");
        $frame.attr("src", "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&modestbranding=1");
      }).on("hidden.bs.modal", function () {
        $frame.attr("src", ""); // stop playback
      });
    }

    /* ---------------- Countdown (70% OFF) ---------------- */
    var $cd = $(".js-countdown");
    if ($cd.length) {
      var end = new Date($cd.data("end") || SETTINGS.offerEnds).getTime();
      var pad = function (n) { return (n < 10 ? "0" : "") + n; };
      var tick = function () {
        var diff = Math.max(0, end - Date.now());
        var d = Math.floor(diff / 864e5);
        var h = Math.floor((diff % 864e5) / 36e5);
        var m = Math.floor((diff % 36e5) / 6e4);
        var s = Math.floor((diff % 6e4) / 1e3);
        $cd.find("[data-cd=d]").text(pad(d));
        $cd.find("[data-cd=h]").text(pad(h));
        $cd.find("[data-cd=m]").text(pad(m));
        $cd.find("[data-cd=s]").text(pad(s));
        if (diff === 0) clearInterval(timer);
      };
      var timer = setInterval(tick, 1000);
      tick();
    }

    /* ---------------- Latest news — 3D parallax image ring ---------------- */
    if ($(".news-ring").length && typeof Swiper !== "undefined") {
      initNewsRing();
    }

    function initNewsRing() {
      var STEP = 30;      // degrees between neighbouring cards
      var MAX_VISIBLE = 3.4; // cards beyond this progress are hidden

      function radius(sw) {
        // Ring radius so neighbouring cards sit just apart on the circle
        var w = $(sw.slides[0]).outerWidth() || 330;
        var k = window.innerWidth < 576 ? 0.42 : 0.6;
        return (w * k) / Math.sin((STEP / 2) * Math.PI / 180);
      }

      function layout(sw) {
        var R = radius(sw);
        $.each(sw.slides, function (i, slide) {
          var p = slide.progress;                 // 0 = centre, ±1 = neighbours
          var clamped = Math.max(-MAX_VISIBLE, Math.min(MAX_VISIBLE, p));
          var angle = -clamped * STEP;            // degrees around the ring
          var rad = angle * Math.PI / 180;
          var x = R * Math.sin(rad);
          var z = R * (Math.cos(rad) - 1);
          // cancel Swiper's linear offset (virtualTranslate) and place on ring
          var tx = -slide.swiperSlideOffset + (sw.width - slide.swiperSlideSize) / 2 + x;
          var abs = Math.abs(p);
          var $s = $(slide);

          $s.css({
            transform: "translate3d(" + tx + "px,0," + z + "px) rotateY(" + angle + "deg)",
            opacity: abs > MAX_VISIBLE ? 0 : Math.max(0, 1 - abs * 0.28),
            zIndex: 100 - Math.round(abs * 10),
            pointerEvents: abs > 1.5 ? "none" : "auto"
          });
          // inner image parallax — drifts opposite to ring motion
          $s.find(".ring-thumb img").css({
            transform: "translate3d(" + (clamped * 9) + "%,0,0)",
            filter: abs < 0.5 ? "none" : "saturate(" + Math.max(0.35, 1 - abs * 0.3) + ") brightness(" + Math.max(0.85, 1 - abs * 0.06) + ")"
          });
        });
      }

      var ring = new Swiper(".news-ring", {
        slidesPerView: "auto",
        centeredSlides: true,
        loop: true,
        loopAdditionalSlides: 3,
        speed: 900,
        grabCursor: true,
        watchSlidesProgress: true,
        virtualTranslate: true,
        slideToClickedSlide: true,
        keyboard: { enabled: true },
        mousewheel: { forceToAxis: true },
        autoplay: { delay: 4200, disableOnInteraction: false, pauseOnMouseEnter: true },
        on: {
          setTranslate: function (sw) { layout(sw); },
          setTransition: function (sw, d) {
            $(sw.slides).css("transition-duration", d + "ms")
              .find(".ring-thumb img").css("transition-duration", d + "ms");
          },
          resize: function (sw) { layout(sw); }
        }
      });
      layout(ring);
      
      // Arrow buttons — driven by jQuery (Swiper's built-in prev fails with loop + custom 3D effect)
      var busy = false;
      function go(step) {
        if (busy) return;                       // ignore clicks while the ring is still turning
        busy = true;
        ring.autoplay && ring.autoplay.stop();
        var n = ring.slides.length;
        var target = (ring.realIndex + step + n) % n;   // wraps 0 → last and last → 0
        ring.slideToLoop(target, ring.params.speed);
        setTimeout(function () {
          busy = false;
          ring.autoplay && ring.autoplay.start();
        }, ring.params.speed);
      }
      $(".ring-prev").on("click", function (e) { e.preventDefault(); go(-1); });
      $(".ring-next").on("click", function (e) { e.preventDefault(); go(1); });
    }

    /* "Read more" — tap support (line grows to fill the row) */
    $(document).on("touchstart", ".read-more", function () {
      $(".read-more").not(this).removeClass("is-open");
      $(this).addClass("is-open");
    });

    /* ---------------- Simple form validation helpers ---------------- */
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var PHONE_RE = /^\+?[0-9\s-]{10,16}$/;

    function validateField($f) {
      var v = $.trim($f.val());
      var ok = true;
      if ($f.prop("required") && !v && !$f.is(":checkbox")) ok = false;
      if ($f.is(":checkbox") && $f.prop("required") && !$f.is(":checked")) ok = false;
      if (ok && v && $f.attr("type") === "email") ok = EMAIL_RE.test(v);
      if (ok && v && $f.attr("type") === "tel") ok = PHONE_RE.test(v);
      if (ok && $f.data("minlength")) ok = v.length >= parseInt($f.data("minlength"), 10);
      if (ok && $f.data("match")) ok = v === $($f.data("match")).val();
      $f.toggleClass("is-invalid", !ok);
      return ok;
    }

    $(".js-validate").each(function () {
      var $form = $(this);
      $form.attr("novalidate", "novalidate");
      $form.on("input change", "input, select, textarea", function () {
        if ($(this).hasClass("is-invalid")) validateField($(this));
      });
      $form.on("submit", function (e) {
        e.preventDefault();
        var valid = true;
        $form.find("input, select, textarea").each(function () {
          if (!validateField($(this))) valid = false;
        });
        var $msg = $form.find(".form-msg");
        if (!valid) {
          $msg.removeClass("ok").addClass("err").text("Please check the highlighted fields.");
          $form.find(".is-invalid").first().trigger("focus");
          return;
        }
        // TODO: connect to your backend / email service here
        var $btn = $form.find("[type=submit]");
        var label = $btn.html();
        $btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm"></span> Please wait');
        setTimeout(function () {
          $btn.prop("disabled", false).html(label);
          $msg.removeClass("err").addClass("ok").text($form.data("success") || "Thank you! We'll be in touch shortly.");
          $form[0].reset();
          $form.find(".pw-meter").attr("data-score", 0);
        }, 900);
      });
    });

    /* ---------------- Student Portal: Sign in / Create account tabs ---------------- */
    var $tabs = $(".auth-tabs");
    if ($tabs.length) {
      var showPane = function (name) {
        $tabs.attr("data-active", name).find("button").removeClass("active").attr("aria-selected", "false")
          .filter('[data-pane="' + name + '"]').addClass("active").attr("aria-selected", "true");
        $(".auth-pane").removeClass("active").filter("#pane-" + name).addClass("active");
        $(".form-msg").text("");
      };
      $tabs.on("click", "button", function () { showPane($(this).data("pane")); });
      $(".js-switch-pane").on("click", function (e) { e.preventDefault(); showPane($(this).data("pane")); });
      if (location.hash === "#register") showPane("register");
    }

    /* Password show/hide */
    $(document).on("click", ".pw-toggle", function () {
      var $inp = $(this).siblings("input");
      var show = $inp.attr("type") === "password";
      $inp.attr("type", show ? "text" : "password");
      $(this).find("i").toggleClass("bi-eye bi-eye-slash");
      $(this).attr("aria-label", show ? "Hide password" : "Show password");
    });

    /* Password strength meter */
    $(document).on("input", ".js-pw-strength", function () {
      var v = $(this).val();
      var score = 0;
      if (v.length >= 8) score++;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
      if (/\d/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      $(this).closest(".mb-3, .col-md-6, .col-12").find(".pw-meter").attr("data-score", v ? Math.max(1, score) : 0);
    });

    /* Close mobile nav after picking a link */
    $(".site-nav .nav-link:not(.dropdown-toggle), .site-nav .mega-item").on("click", function () {
      var $menu = $("#siteMenu");
      if ($menu.hasClass("show")) bootstrap.Collapse.getOrCreateInstance($menu[0]).hide();
    });
  });
})(jQuery);
