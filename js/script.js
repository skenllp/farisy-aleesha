/* ============================================================
   SALMANUL FARISY & ALEESHA — GROOM'S SIDE RECEPTION
   Vanilla JS — gate intro, countdown, scroll reveals
   ============================================================ */
(function () {
  "use strict";

  var gate = document.getElementById("gate");
  var gateButton = document.getElementById("gateButton");
  var invitation = document.getElementById("invitation");
  var scrollCue = document.getElementById("scrollCue");

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Open the gate → reveal invitation ---------- */
  function openGate() {
    if (!gate) return;

    // Slide the gate panels apart + dissolve the blur layer
    gate.classList.add("is-open");

    // Reveal the invitation just before the gate fully fades out —
    // the hero (same background, no blur) shines through seamlessly
    var revealAt = prefersReducedMotion ? 100 : 800;

    window.setTimeout(function () {
      invitation.classList.add("is-visible");
      invitation.setAttribute("aria-hidden", "false");
      document.body.classList.remove("locked");

      // move focus into the invitation for accessibility
      var hero = document.getElementById("hero");
      if (hero) hero.setAttribute("tabindex", "-1");
      if (hero) hero.focus({ preventScroll: true });
    }, revealAt);
  }

  if (gateButton) {
    document.body.classList.add("locked");
    gateButton.addEventListener("click", openGate);
    gateButton.addEventListener("keyup", function (e) {
      if (e.key === "Enter" || e.key === " ") openGate();
    });
  }

  if (scrollCue) {
    scrollCue.addEventListener("click", function () {
      var ayah = document.getElementById("ayah");
      if (ayah) ayah.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Countdown timer ---------- */
  // Reception date: 3 January 2027 (shown only after the scratch card is revealed)
  var WEDDING_DATE = new Date("2027-01-03T00:00:00");

  var elDays = document.getElementById("cd-days");
  var elHours = document.getElementById("cd-hours");
  var elMins = document.getElementById("cd-mins");
  var elSecs = document.getElementById("cd-secs");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function setCountdownNum(el, value) {
    if (!el || el.textContent === value) return;
    el.textContent = value;
    if (prefersReducedMotion) return;
    el.classList.remove("countdown__num--pulse");
    // force reflow so the animation can restart on rapid updates
    void el.offsetWidth;
    el.classList.add("countdown__num--pulse");
  }

  function tickCountdown() {
    var now = new Date();
    var diff = WEDDING_DATE.getTime() - now.getTime();

    if (diff <= 0) {
      setCountdownNum(elDays, "00");
      setCountdownNum(elHours, "00");
      setCountdownNum(elMins, "00");
      setCountdownNum(elSecs, "00");
      return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    var mins = Math.floor((diff / (1000 * 60)) % 60);
    var secs = Math.floor((diff / 1000) % 60);

    setCountdownNum(elDays, pad(days));
    setCountdownNum(elHours, pad(hours));
    setCountdownNum(elMins, pad(mins));
    setCountdownNum(elSecs, pad(secs));
  }

  if (elDays && elHours && elMins && elSecs) {
    tickCountdown();
    window.setInterval(tickCountdown, 1000);
  }

  /* ---------- Gentle parallax on hero glyph (respects reduced motion) ---------- */
  var topGlyph = document.querySelector(".glyph--top");

  if (!prefersReducedMotion && topGlyph) {
    window.addEventListener(
      "scroll",
      function () {
        var y = window.scrollY;
        topGlyph.style.transform = "translateY(" + Math.min(y * 0.08, 30) + "px)";
      },
      { passive: true }
    );
  }

  /* ---------- Elegant scroll progress line ---------- */
  var progressBar = document.getElementById("scrollProgressBar");
  function updateProgress() {
    if (!progressBar) return;
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* ---------- Subtle desktop-only hero parallax (background drifts slower than scroll) ---------- */
  var heroSection = document.querySelector(".hero");
  var desktopQuery = window.matchMedia("(min-width: 900px)");

  if (!prefersReducedMotion && heroSection) {
    window.addEventListener(
      "scroll",
      function () {
        if (!desktopQuery.matches) return;
        var offset = Math.min(window.scrollY * 0.15, 80);
        heroSection.style.backgroundPosition = "center calc(50% + " + offset + "px)";
      },
      { passive: true }
    );
  }
  /* ---------- Background music ---------- */
  var audio      = document.getElementById("bg-music");
  var muteBtn    = document.getElementById("mute-btn");
  var iconSound  = document.getElementById("icon-sound");
  var iconMuted  = document.getElementById("icon-muted");

  var musicStarted = false;

  function setMuteIcon(playing) {
    if (iconSound) iconSound.style.display = playing ? "" : "none";
    if (iconMuted) iconMuted.style.display = playing ? "none" : "";
  }

  function startMusic() {
    if (musicStarted || !audio) return;
    audio.volume = 0.45;
    audio.play().then(function () {
      musicStarted = true;
      setMuteIcon(true);
    }).catch(function () {
      // Browser blocked autoplay — muted icon stays, user can tap the button
    });
  }

  // Try immediate autoplay on load (works on some browsers / after reload)
  window.addEventListener("load", function () {
    startMusic();
  });

  // Fallback: start on first user interaction (gate button click counts)
  document.addEventListener("click",      startMusic, { once: true });
  document.addEventListener("touchstart", startMusic, { once: true });
  document.addEventListener("scroll",     startMusic, { once: true });

  // Mute / unmute toggle
  if (muteBtn && audio) {
    muteBtn.addEventListener("click", function (e) {
      e.stopPropagation(); // don't double-trigger startMusic via document click
      if (!musicStarted) {
        startMusic();
        return;
      }
      if (audio.paused) {
        audio.play();
        setMuteIcon(true);
      } else {
        audio.pause();
        setMuteIcon(false);
      }
    });
  }

  // Stop music when user navigates away (back/forward/close/tab switch)
  window.addEventListener("pagehide", function () {
    if (audio && !audio.paused) { audio.pause(); audio.currentTime = 0; }
  });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden" && audio && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
  });

  /* ---------- Guest personalisation (?guest=Name in URL) ---------- */
  /*
  (function () {
    var params = new URLSearchParams(window.location.search);
    var raw    = params.get("guest") || "";

    // Sanitise: strip all HTML tags, trim whitespace, cap at 60 chars
    var name = raw.replace(/<[^>]*>/g, "").trim().slice(0, 60);
    if (!name) return;

    var el = document.getElementById("heroGuest");
    if (!el) return;

    // Capitalise first letter of each word nicely
    name = name.replace(/\b\w/g, function (c) { return c.toUpperCase(); });

    el.innerHTML =
      "Dear <span class=\"hero__guest-name\">" + name + "</span>," +
      "<br>you are cordially invited.";
    el.classList.add("is-visible");
  }());
  */

  /* ---------- RSVP — attendance toggle, counter, WhatsApp redirect ---------- */
  (function () {
    var form      = document.getElementById("rsvpForm");
    if (!form) return;

    var btnYes    = document.getElementById("btnYes");
    var btnNo     = document.getElementById("btnNo");
    var minusBtn  = document.getElementById("rsvpMinus");
    var plusBtn   = document.getElementById("rsvpPlus");
    var countEl   = document.getElementById("rsvpCount");
    var nameEl    = document.getElementById("rsvpName");
    var msgEl     = document.getElementById("rsvpMessage");
    var WA_NUMBER = ""; // add the RSVP WhatsApp number here (digits only, e.g. 919XXXXXXXXX); blank = guest picks the contact

    // ---- attendance toggle ----
    function setAttendance(attending) {
      btnYes.classList.toggle("is-selected",  attending);
      btnNo.classList.toggle("is-selected",  !attending);
      btnYes.querySelector("input").checked =  attending;
      btnNo.querySelector("input").checked  = !attending;
    }
    setAttendance(true); // default: yes

    btnYes.addEventListener("click", function () { setAttendance(true);  });
    btnNo.addEventListener("click",  function () { setAttendance(false); });

    // ---- counter ----
    minusBtn.addEventListener("click", function () {
      var v = parseInt(countEl.value, 10);
      if (v > 1) countEl.value = v - 1;
    });
    plusBtn.addEventListener("click", function () {
      var v = parseInt(countEl.value, 10);
      if (v < 10) countEl.value = v + 1;
    });

    // ---- submit → WhatsApp ----
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // validate name
      var name = nameEl.value.trim();
      if (!name) {
        nameEl.classList.add("is-error");
        nameEl.focus();
        return;
      }
      nameEl.classList.remove("is-error");

      var attending = btnYes.classList.contains("is-selected");
      var count     = parseInt(countEl.value, 10) || 1;
      var message   = msgEl ? msgEl.value.trim() : "";

      // build the WhatsApp message
      var lines = [];
      lines.push("Assalamu Alaikum \uD83C\uDF39");
      lines.push("");
      lines.push("*Salmanul Farisy & Aleesha — Groom's Side Reception RSVP*");
      lines.push("");
      lines.push("*Name:* " + name);
      lines.push("*Attendance:* " + (attending ? "\u2705 Joyfully Accepts" : "\u274C Regretfully Declines"));
      if (attending) {
        lines.push("*Number of Guests:* " + count);
      }
      if (message) {
        lines.push("*Message:* " + message);
      }
      lines.push("");
      lines.push("_Sent from the wedding invitation_");

      var text = encodeURIComponent(lines.join("\n"));
      window.open("https://wa.me/" + WA_NUMBER + "?text=" + text, "_blank");
    });

    // clear error state on input
    nameEl.addEventListener("input", function () {
      nameEl.classList.remove("is-error");
    });
  }());

})();

/* ==========================================================================
   Floating Flowers — full-viewport falling petal animation
   Vanilla JS · no dependencies
   ========================================================================== */

function initFloatingFlowers() {
  var container = document.getElementById("floating-flowers");
  if (!container) return;

  // Respect user's motion preference — skip entirely
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Color palette — matches the site's brand tokens
  var colors = [
    "#C9A07A", // warm gold
    "#E8D0AA", // light gold
    "#9A7040", // dark gold
    "#8A9678", // sage green
    "#D4DBC8", // pale celadon
    "#626D53", // forest green
  ];

  // Fewer petals on smaller screens for performance
  var w = window.innerWidth;
  var PETAL_COUNT = w < 640 ? 6 : w < 1024 ? 9 : 14;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function flowerSVG(color) {
    // 5-petal flower: each petal is an ellipse rotated around the centre
    return '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
      + '<g fill="' + color + '">'
      + '<ellipse cx="20" cy="10" rx="6" ry="10" opacity="0.9"/>'
      + '<ellipse cx="20" cy="10" rx="6" ry="10" transform="rotate(72 20 20)" opacity="0.9"/>'
      + '<ellipse cx="20" cy="10" rx="6" ry="10" transform="rotate(144 20 20)" opacity="0.9"/>'
      + '<ellipse cx="20" cy="10" rx="6" ry="10" transform="rotate(216 20 20)" opacity="0.9"/>'
      + '<ellipse cx="20" cy="10" rx="6" ry="10" transform="rotate(288 20 20)" opacity="0.9"/>'
      + '<circle cx="20" cy="20" r="4.5" fill="#FBF4E3"/>'
      + '</g></svg>';
  }

  for (var i = 0; i < PETAL_COUNT; i++) {
    var petal    = document.createElement("div");
    petal.className = "flower-petal";

    var size     = rand(12, 26);          // px
    var duration = rand(16, 28);          // seconds per full loop
    var delay    = -rand(0, duration);    // negative = already mid-animation on page load
    var color    = colors[Math.floor(Math.random() * colors.length)];
    var opacity  = rand(0.45, 0.80);

    petal.style.width             = size.toFixed(0) + "px";
    petal.style.height            = size.toFixed(0) + "px";
    petal.style.left              = rand(0, 100).toFixed(1) + "%";
    petal.style.animationDuration = duration.toFixed(1) + "s";
    petal.style.animationDelay   = delay.toFixed(1) + "s";
    petal.style.setProperty("--op", opacity.toFixed(2));

    petal.innerHTML = flowerSVG(color);
    container.appendChild(petal);
  }
}

document.addEventListener("DOMContentLoaded", initFloatingFlowers);

/* ==========================================================================
   Gate — Interactive enhancements
   · Letter-by-letter name stagger
   · Mouse / touch parallax on the background layer
   · Gold particle canvas (twinkling stars)
   · Button click ripple
   ========================================================================== */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     1. LETTER STAGGER — split the names into individual
        <span class="gate__letter"> elements and animate each in with
        a cascading delay.
  ------------------------------------------------------------------ */
  function buildLetters(containerId, word, baseDelay) {
    var el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = "";
    for (var i = 0; i < word.length; i++) {
      var span = document.createElement("span");
      span.className = "gate__letter";
      span.textContent = word[i] === " " ? "\u00A0" : word[i];
      // stagger: each letter 60 ms after the previous
      var delay = baseDelay + i * 0.06;
      span.style.animationDelay = delay.toFixed(2) + "s";
      el.appendChild(span);
    }
  }

  // name 1 starts at 1.9 s, name 2 starts at 2.6 s
  buildLetters("gateName1", "Salmanul Farisy",   1.9);
  buildLetters("gateName2", "Aleesha", 3.2);

  // After all letters have landed, add the subtle heartbeat glow
  var namesEl = document.querySelector(".gate__names");
  if (namesEl && !reduced) {
    window.setTimeout(function () {
      namesEl.classList.add("is-beating");
    }, 4000);
  }

  /* ------------------------------------------------------------------
     2. MOUSE / TOUCH PARALLAX — the .gate__parallax layer shifts
        subtly opposite to cursor position, giving a 3-D depth feel.
  ------------------------------------------------------------------ */
  var parallaxLayer = document.getElementById("gateParallax");
  var gate          = document.getElementById("gate");

  if (parallaxLayer && gate && !reduced) {
    // Reveal the parallax layer once page is loaded
    window.setTimeout(function () {
      parallaxLayer.classList.add("is-ready");
    }, 600);

    var tX = 0, tY = 0;   // target offsets
    var cX = 0, cY = 0;   // current (lerped) offsets
    var rafId = null;
    var MAX   = 14;        // max pixel shift

    function lerp(a, b, t) { return a + (b - a) * t; }

    function tickParallax() {
      cX = lerp(cX, tX, 0.06);
      cY = lerp(cY, tY, 0.06);
      parallaxLayer.style.transform =
        "translate3d(" + cX.toFixed(2) + "px," + cY.toFixed(2) + "px,0)";
      rafId = requestAnimationFrame(tickParallax);
    }
    rafId = requestAnimationFrame(tickParallax);

    function onMouseMove(e) {
      var cx = window.innerWidth  / 2;
      var cy = window.innerHeight / 2;
      tX = ((e.clientX - cx) / cx) * -MAX;
      tY = ((e.clientY - cy) / cy) * -MAX;
    }

    function onTouchMove(e) {
      if (!e.touches.length) return;
      var cx = window.innerWidth  / 2;
      var cy = window.innerHeight / 2;
      tX = ((e.touches[0].clientX - cx) / cx) * -(MAX * 0.5);
      tY = ((e.touches[0].clientY - cy) / cy) * -(MAX * 0.5);
    }

    gate.addEventListener("mousemove",  onMouseMove,  { passive: true });
    gate.addEventListener("touchmove",  onTouchMove,  { passive: true });

    // stop the RAF once gate is opened to save resources
    var gateBtn = document.getElementById("gateButton");
    if (gateBtn) {
      gateBtn.addEventListener("click", function () {
        cancelAnimationFrame(rafId);
        gate.removeEventListener("mousemove", onMouseMove);
        gate.removeEventListener("touchmove",  onTouchMove);
      }, { once: true });
    }
  }

  /* ------------------------------------------------------------------
     3. GOLD PARTICLE CANVAS — tiny glowing gold dots that twinkle
        independently, layered behind the content.
  ------------------------------------------------------------------ */
  var canvas = document.getElementById("gateCanvas");
  if (canvas && !reduced) {
    var ctx    = canvas.getContext("2d");
    var COLORS = ["rgba(203,169,104,", "rgba(231,216,174,", "rgba(169,129,47,"];
    var particles = [];
    var animFrameId;

    function resizeCanvas() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    // spawn a single particle at a random position
    function makeParticle() {
      return {
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height,
        r:       0.6 + Math.random() * 1.8,        // radius 0.6–2.4 px
        alpha:   0,
        maxAlpha:0.25 + Math.random() * 0.55,
        speed:   0.004 + Math.random() * 0.008,    // fade speed
        phase:   Math.random() * Math.PI * 2,      // sine offset
        color:   COLORS[Math.floor(Math.random() * COLORS.length)]
      };
    }

    // populate: fewer on mobile
    var COUNT = window.innerWidth < 640 ? 55 : window.innerWidth < 1024 ? 90 : 140;
    for (var i = 0; i < COUNT; i++) {
      var p = makeParticle();
      p.phase = Math.random() * Math.PI * 2;       // scatter phases so they don't all pulse together
      particles.push(p);
    }

    function drawParticles(time) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var t = time * 0.001;
      for (var j = 0; j < particles.length; j++) {
        var pt = particles[j];
        // sine-driven alpha gives a natural twinkle
        pt.alpha = pt.maxAlpha * (0.5 + 0.5 * Math.sin(t * pt.speed * 60 + pt.phase));
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fillStyle = pt.color + pt.alpha.toFixed(3) + ")";
        ctx.fill();

        // occasional soft glow halo on larger particles
        if (pt.r > 1.4) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.r * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = pt.color + (pt.alpha * 0.18).toFixed(3) + ")";
          ctx.fill();
        }
      }
      animFrameId = requestAnimationFrame(drawParticles);
    }
    animFrameId = requestAnimationFrame(drawParticles);

    // stop canvas when gate closes
    var gateBtnForCanvas = document.getElementById("gateButton");
    if (gateBtnForCanvas) {
      gateBtnForCanvas.addEventListener("click", function () {
        window.setTimeout(function () {
          cancelAnimationFrame(animFrameId);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 1600);
      }, { once: true });
    }
  }

  /* ------------------------------------------------------------------
     4. BUTTON RIPPLE — on click, inject a .gate__ripple element that
        expands outward from the exact click/touch point.
  ------------------------------------------------------------------ */
  var gateButtonEl = document.getElementById("gateButton");
  if (gateButtonEl && !reduced) {
    gateButtonEl.addEventListener("click", function (e) {
      var rect   = gateButtonEl.getBoundingClientRect();
      var size   = Math.max(rect.width, rect.height);
      var x      = (e.clientX || rect.left + rect.width  / 2) - rect.left - size / 2;
      var y      = (e.clientY || rect.top  + rect.height / 2) - rect.top  - size / 2;
      var ripple = document.createElement("span");
      ripple.className = "gate__ripple";
      ripple.style.cssText =
        "width:" + size + "px;height:" + size + "px;left:" + x + "px;top:" + y + "px;";
      gateButtonEl.appendChild(ripple);
      // clean up after animation
      window.setTimeout(function () {
        if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
      }, 750);
    });
  }

}());

/* ==========================================================================
   Scratch Card — date reveal
   · The date lives only here and is injected into the DOM after reveal.
   · Pointer events (mouse + touch + pen) on a <canvas>; destination-out erase.
   · Auto-reveals once ~55% of the surface has been scratched.
   ========================================================================== */
(function () {
  "use strict";

  var root   = document.getElementById("scratch");
  var stage  = document.getElementById("scratchStage");
  var canvas = document.getElementById("scratchCanvas");
  var fx     = document.getElementById("scratchFx");
  var dateEl = document.getElementById("scratchDate");
  if (!root || !stage || !canvas || !fx || !dateEl) return;

  var REVEAL_TEXT = "03 JANUARY 2027";
  var THRESHOLD   = 0.25;           // fraction scratched before auto-reveal
  var reduced     = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var ctx = canvas.getContext("2d", { willReadFrequently: true });
  var fctx = fx.getContext("2d");
  var W = 0, H = 0, dpr = 1;
  var drawing = false, last = null, revealed = false, checkTimer = 0, dirty = false;
  var brush = 22;

  /* ---------- heart path helper — matches the SVG clipPath exactly ---------- */
  function heartPath(ctx2d, w, h) {
    // Mirrors the objectBoundingBox clipPath: M0.5,0.92 …
    ctx2d.beginPath();
    ctx2d.moveTo(w * 0.5,  h * 0.92);
    ctx2d.bezierCurveTo(w * 0.5,  h * 0.92,
                        w * 0.04, h * 0.60,
                        w * 0.04, h * 0.30);
    ctx2d.bezierCurveTo(w * 0.04, h * 0.12,
                        w * 0.16, h * 0.03,
                        w * 0.30, h * 0.03);
    ctx2d.bezierCurveTo(w * 0.39, h * 0.03,
                        w * 0.46, h * 0.08,
                        w * 0.5,  h * 0.14);
    ctx2d.bezierCurveTo(w * 0.54, h * 0.08,
                        w * 0.61, h * 0.03,
                        w * 0.70, h * 0.03);
    ctx2d.bezierCurveTo(w * 0.84, h * 0.03,
                        w * 0.96, h * 0.12,
                        w * 0.96, h * 0.30);
    ctx2d.bezierCurveTo(w * 0.96, h * 0.60,
                        w * 0.5,  h * 0.92,
                        w * 0.5,  h * 0.92);
    ctx2d.closePath();
  }

  /* ---------- paint the gold scratch surface ---------- */
  function paintSurface() {
    var w = W, h = H;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);

    // clip everything to the heart shape
    heartPath(ctx, w, h);
    ctx.clip();

    // base brushed-gold gradient
    var g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0,   "#E7D8AE");
    g.addColorStop(0.28,"#CBA968");
    g.addColorStop(0.5, "#E9D9A8");
    g.addColorStop(0.72,"#B98F3E");
    g.addColorStop(1,   "#D8BE7E");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // fine diagonal sheen lines
    ctx.strokeStyle = "rgba(255,255,255,.14)";
    ctx.lineWidth = 1;
    for (var x = -h; x < w; x += 7) {
      ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + h, 0); ctx.stroke();
    }

    // sparkle speckle
    for (var i = 0; i < 70; i++) {
      var sx = Math.random() * w, sy = Math.random() * h;
      ctx.fillStyle = "rgba(255,255,255," + (0.12 + Math.random() * 0.3).toFixed(2) + ")";
      ctx.beginPath(); ctx.arc(sx, sy, Math.random() * 1.3 + 0.3, 0, Math.PI * 2); ctx.fill();
    }

    // heart border stroke
    heartPath(ctx, w, h);
    ctx.strokeStyle = "rgba(111,78,20,.55)"; ctx.lineWidth = 2.5;
    ctx.stroke();
    heartPath(ctx, w, h);
    ctx.strokeStyle = "rgba(255,248,224,.5)"; ctx.lineWidth = 1;
    ctx.stroke();

    // text — centred in the wide belly of the heart (top 30 % – 62 %)
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(255,248,224,.8)"; ctx.shadowOffsetY = 1; ctx.shadowBlur = 0;
    ctx.fillStyle = "#4a3410";
    var maxTextW = w * 0.55;                     // safe width inside the heart
    var fs1 = Math.round(h * 0.11);
    ctx.font = "italic 500 " + fs1 + "px 'Playfair Display', Georgia, serif";
    while (ctx.measureText("A Special Day").width > maxTextW && fs1 > 8) {
      fs1 -= 1; ctx.font = "italic 500 " + fs1 + "px 'Playfair Display', Georgia, serif";
    }
    var line1Y = h * 0.36;
    ctx.fillText("A Special Day", w / 2, line1Y);
    ctx.fillText("Awaits\u2026",   w / 2, line1Y + fs1 * 1.35);

    // ornament line — sits just below the two text lines
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(74,52,16,.6)"; ctx.lineWidth = 1;
    var oy = line1Y + fs1 * 1.35 + fs1 * 0.9;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 32, oy); ctx.lineTo(w / 2 - 7, oy);
    ctx.moveTo(w / 2 + 7,  oy); ctx.lineTo(w / 2 + 32, oy);
    ctx.stroke();
    ctx.fillStyle = "rgba(74,52,16,.75)";
    ctx.save(); ctx.translate(w / 2, oy); ctx.rotate(Math.PI / 4); ctx.fillRect(-2.5, -2.5, 5, 5); ctx.restore();

    // sub-text — small label below ornament, still in the wide zone
    ctx.shadowColor = "rgba(255,248,224,.8)"; ctx.shadowOffsetY = 1;
    ctx.fillStyle = "#4a3410";
    var fs2 = Math.max(8, Math.round(h * 0.065));
    var ls = "letterSpacing" in ctx ? 2 : 0;
    function setSub() {
      ctx.font = "600 " + fs2 + "px 'Cormorant Garamond', Georgia, serif";
      if ("letterSpacing" in ctx) ctx.letterSpacing = ls + "px";
    }
    setSub();
    var subLabel = "SCRATCH TO REVEAL";
    while (ctx.measureText(subLabel).width > maxTextW && fs2 > 7) {
      fs2 -= 1; ls = Math.max(0, ls - 0.2); setSub();
    }
    ctx.fillText(subLabel, w / 2, oy + fs2 * 1.5);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    ctx.restore();
  }

  function size() {
    var r = stage.getBoundingClientRect();
    if (!r.width) return;
    W = Math.round(r.width); H = Math.round(r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    [canvas, fx].forEach(function (c) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
    brush = Math.max(18, Math.round(W * 0.07));
    paintSurface();
  }

  /* ---------- scratching ---------- */
  function pos(e) {
    var r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
  }

  function erase(a, b) {
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.lineWidth = brush;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.restore();
    dirty = true;
  }

  function scratchedFraction() {
    // sample a coarse grid of the alpha channel
    var cw = canvas.width, ch = canvas.height;
    var data;
    try { data = ctx.getImageData(0, 0, cw, ch).data; } catch (err) { return 0; }
    var step = Math.max(4, Math.round(Math.min(cw, ch) / 40)), total = 0, clear = 0;
    for (var y = 0; y < ch; y += step) {
      for (var x = 0; x < cw; x += step) {
        total++;
        if (data[(y * cw + x) * 4 + 3] < 128) clear++;
      }
    }
    return total ? clear / total : 0;
  }

  function scheduleCheck() {
    if (checkTimer || revealed) return;
    checkTimer = window.setTimeout(function () {
      checkTimer = 0;
      if (dirty && !revealed && scratchedFraction() >= THRESHOLD) reveal();
      dirty = false;
    }, 120);
  }

  function down(e) {
    if (revealed) return;
    drawing = true;
    last = pos(e);
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    erase(last, { x: last.x + 0.01, y: last.y + 0.01 });
    e.preventDefault();
  }
  function move(e) {
    if (!drawing || revealed) return;
    var p = pos(e);
    erase(last, p);
    last = p;
    scheduleCheck();
    e.preventDefault();
  }
  function up(e) {
    if (!drawing) return;
    drawing = false; last = null;
    try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
    scheduleCheck();
  }

  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  // keyboard / assistive-tech fallback
  canvas.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); reveal(); }
  });

  /* ---------- reveal + golden particles ---------- */
  function reveal() {
    if (revealed) return;
    revealed = true;
    dateEl.textContent = REVEAL_TEXT;       // date enters the DOM only now
    root.classList.add("is-revealed");
    canvas.setAttribute("aria-label", "Date revealed: " + REVEAL_TEXT);
    canvas.tabIndex = -1;

    var cd = document.getElementById("countdown");
    if (cd) {
      cd.classList.remove("countdown--locked");
      cd.classList.add("countdown--unlocked");
    }
    if (!reduced) burst();
  }

  function burst() {
    var COLORS = ["#CBA968", "#E7D8AE", "#A9812F", "#F4E7BC", "#fff6d8"];
    var count = W < 400 ? 46 : 70, parts = [], i;
    for (i = 0; i < count; i++) {
      var a = Math.random() * Math.PI * 2, sp = 1.2 + Math.random() * 3.4;
      parts.push({
        x: W / 2, y: H / 2,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.8,
        r: 0.8 + Math.random() * 2.2, life: 1,
        decay: 0.011 + Math.random() * 0.012,
        c: COLORS[(Math.random() * COLORS.length) | 0]
      });
    }
    function frame() {
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fctx.clearRect(0, 0, W, H);
      var alive = false;
      for (var j = 0; j < parts.length; j++) {
        var p = parts[j];
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx; p.y += p.vy; p.vy += 0.045; p.vx *= 0.985; p.life -= p.decay;
        fctx.globalAlpha = Math.max(p.life, 0);
        fctx.fillStyle = p.c;
        fctx.beginPath(); fctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); fctx.fill();
        fctx.globalAlpha = Math.max(p.life, 0) * 0.18;
        fctx.beginPath(); fctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2); fctx.fill();
      }
      fctx.globalAlpha = 1;
      if (alive) requestAnimationFrame(frame); else fctx.clearRect(0, 0, W, H);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- init / resize (never re-covers once revealed) ---------- */
  function init() { if (!revealed) size(); }
  var resizeT;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeT);
    resizeT = window.setTimeout(function () {
      if (revealed || drawing) return;
      // keep progress simple: only repaint if nothing scratched yet
      if (scratchedFraction() < 0.02) size();
    }, 200);
  });

  // the card sits inside a .reveal block; size once fonts + layout are ready
  var fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  fontsReady.then(function () {
    init();
    // layout may change after the gate opens; re-measure when scrolled near
    if ("IntersectionObserver" in window) {
      var seen = false;
      new IntersectionObserver(function (en, ob) {
        if (en[0].isIntersecting && !seen) {
          seen = true;
          if (!revealed && scratchedFraction() < 0.02) size();
          ob.disconnect();
        }
      }, { threshold: 0.2 }).observe(stage);
    }
  });
})();
