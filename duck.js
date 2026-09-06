/* The duck. A small mascot that paces the bottom of the page, reacts when you
 * run a command, and nudges non-terminal visitors with suggestions.
 *
 * Toggle from the terminal: `duck` / `duck off`. State persists in localStorage.
 * Respects prefers-reduced-motion (no pacing, tips still rotate).
 */

(() => {
  const KEY = "duck";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const FRAMES = {
    idle: ["  __", " <(o)", ' (_)"', '  ""'],
    a:    ["  __", " <(o)", " (_)/", "  /\\"],
    b:    ["  __", " <(o)", " (_)\\", "  \\/"],
  };

  const TIPS = [
    "psst — type  help",
    "try  about  ·  school",
    "not sure? click a word up top",
    "run  ls  to look around",
    "cat about.txt",
    "quack",
  ];
  const REACTS = ["quack!", "nice.", "ooh.", "*flap*", "neat.", "quack."];
  const pick = (a) => a[(Math.random() * a.length) | 0];

  let el, sprite, bubble, x = 24, dir = 1, tick = 0, paused = 0, bubbleT = 0;
  const maxX = () => Math.max(40, innerWidth - 90);

  function build() {
    if (el) { el.hidden = false; return; }
    el = document.createElement("div");
    el.id = "duck";
    bubble = document.createElement("div");
    bubble.className = "bubble";
    sprite = document.createElement("pre");
    sprite.className = "sprite";
    setFrame("idle");
    el.append(bubble, sprite);
    document.body.append(el);

    sprite.addEventListener("click", () => { say(pick(REACTS), 2200); if (!reduce) spin(); });

    if (reduce) { x = maxX(); place(); rotateTips(); }
    else requestAnimationFrame(loop);
  }

  const setFrame = (k) => { sprite.textContent = FRAMES[k].join("\n"); };
  const place = () => { el.style.transform = `translateX(${x}px)`; sprite.classList.toggle("flip", dir < 0); };

  function say(msg, ms = 5200) {
    if (!bubble) return;
    bubble.textContent = msg;
    bubble.classList.add("show");
    clearTimeout(bubbleT);
    bubbleT = setTimeout(() => bubble.classList.remove("show"), ms);
  }

  function spin() {
    sprite.classList.add("spin");
    setTimeout(() => sprite.classList.remove("spin"), 480);
  }

  function loop() {
    tick++;
    if (paused > 0) {
      paused--;
      setFrame("idle");
      if (paused > 0 && Math.random() < 0.012 && !bubble.classList.contains("show")) say(pick(TIPS));
    } else {
      x += dir * 0.7;
      setFrame(tick % 14 < 7 ? "a" : "b");
      if (x <= 24) { x = 24; dir = 1; paused = 200; }
      else if (x >= maxX()) { x = maxX(); dir = -1; paused = 200; }
      else if (Math.random() < 0.004) paused = 140 + Math.random() * 200;
    }
    place();
    requestAnimationFrame(loop);
  }

  function rotateTips() {
    say(pick(TIPS));
    setTimeout(rotateTips, 14000);
  }

  addEventListener("cmd", () => {
    if (!el || el.hidden) return;
    paused = 220;
    say(pick(REACTS), 2400);
    if (!reduce) spin();
  });

  window.__duck = {
    set(on) {
      if (on) { localStorage.removeItem(KEY); build(); }
      else { localStorage.setItem(KEY, "off"); if (el) el.hidden = true; }
    },
  };

  if (localStorage.getItem(KEY) !== "off") build();
})();
