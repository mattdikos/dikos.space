/* Ducky. A small mascot that paces the bottom of the page, reacts when you run
 * a command, tells you what to try, and shares short (duck) facts. Click him and
 * he gets pinched.
 *
 * Toggle from the terminal: `duck` / `duck off` (alias: `ducky`). State persists.
 * Respects prefers-reduced-motion (no pacing; he still talks).
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
  ];

  const FACTS = [
    "a group of ducks is a raft.",
    "ducks sleep with one eye open.",
    "ducklings walk within hours of hatching.",
    "ducks see more colours than you.",
    "a duck's quack does echo, actually.",
    "rubber-duck debugging is a real thing.",
    "ducks have waterproof feathers.",
    "some ducks migrate 3000+ km.",
    "no nerves in a duck's feet — no cold.",
    "mallards are the granddad of pet ducks.",
  ];

  const REACTS = ["quack!", "nice.", "ooh.", "*flap*", "neat.", "quack."];
  const IDLE = ["*preens*", "z  z  z", "*looks around*", "*ruffles feathers*"];
  const PINCH = ["hey!", "ow — quit it.", "rude.", "i will bite.", "...", "telling matus.", "😑"];

  const pick = (a) => a[(Math.random() * a.length) | 0];

  let el, sprite, bubble, x = 24, dir = 1, tick = 0, paused = 0, bubbleT = 0, pinches = 0, said = false;
  const maxX = () => Math.max(40, innerWidth - 60);

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

    sprite.addEventListener("click", pinch);

    if (reduce) { x = maxX(); place(); }
    else requestAnimationFrame(loop);

    setTimeout(() => { if (!said) { said = true; say("hi! i'm ducky 🦆", 4000); } }, 1800);
    rotate();
  }

  const setFrame = (k) => { sprite.textContent = FRAMES[k].join("\n"); };
  const place = () => { el.style.transform = `translateX(${x}px)`; sprite.classList.toggle("flip", dir < 0); };

  function say(msg, ms = 5200) {
    if (!bubble) return;
    bubble.textContent = msg;
    bubble.style.transform = "none";
    bubble.classList.add("show");
    // keep the bubble inside the viewport near the edges
    const r = bubble.getBoundingClientRect();
    const over = r.right - (innerWidth - 8);
    const under = 8 - r.left;
    if (over > 0) bubble.style.transform = `translateX(${-over}px)`;
    else if (under > 0) bubble.style.transform = `translateX(${under}px)`;
    clearTimeout(bubbleT);
    bubbleT = setTimeout(() => bubble.classList.remove("show"), ms);
  }

  function anim(cls, ms) {
    sprite.classList.add(cls);
    setTimeout(() => sprite.classList.remove(cls), ms);
  }

  function pinch() {
    pinches++;
    paused = Math.max(paused, 160);
    say(PINCH[Math.min(pinches - 1, PINCH.length - 1)], 2400);
    if (!reduce) anim("pinch", 360);
    setTimeout(() => { pinches = Math.max(0, pinches - 1); }, 9000);
  }

  function loop() {
    tick++;
    if (paused > 0) {
      paused--;
      setFrame("idle");
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

  // rotating chatter while he's standing still
  function rotate() {
    const delay = 11000 + Math.random() * 8000;
    setTimeout(() => {
      if (el && !el.hidden && (reduce || paused > 0) && !bubble.classList.contains("show")) {
        const r = Math.random();
        say(r < 0.45 ? pick(FACTS) : r < 0.85 ? pick(TIPS) : pick(IDLE));
      }
      rotate();
    }, delay);
  }

  addEventListener("cmd", () => {
    if (!el || el.hidden) return;
    paused = 220;
    say(pick(REACTS), 2400);
    if (!reduce) anim("spin", 480);
  });

  window.__duck = {
    set(on) {
      if (on) { localStorage.removeItem(KEY); build(); }
      else { localStorage.setItem(KEY, "off"); if (el) el.hidden = true; }
    },
    fact() { if (el && !el.hidden) say(pick(FACTS)); },
  };

  if (localStorage.getItem(KEY) !== "off") build();
})();
