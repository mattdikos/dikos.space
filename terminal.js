/* Interactive terminal.
 *
 * `boot` runs on load, then the prompt goes live: type a command, press Enter.
 * Tab / -> accepts the ghost completion. Up / Down walks history.
 *
 * Add content by editing the `commands` map. Each command returns an array of
 * output lines; HTML is allowed in a line (e.g. links, coloured spans).
 */

const boot = {
  lines: [
    "booting …",
    "  mount /home/matus … ok",
    "  load shell … ok",
    "",
  ],
  cmd: { cmd: "whoami", out: ["matus"] },
};

const commands = {
  help: () => ["commands: " + names().filter((n) => !HIDDEN.has(n)).join(", ")],

  whoami: () => ["matus"],

  about: () => [
    "matus.",
    "this site is a scratchpad; expect it to grow weird over time.",
    "",
    '<span class="dim">a proper cv goes here later — edit terminal.js → commands.about</span>',
  ],

  school: () => [
    '<span class="dim">school info goes here — edit terminal.js → commands.school</span>',
  ],

  projects: () => [
    "nothing here yet.",
  ],

  contact: () => [
    '  github   <a href="https://github.com/mattdikos">github.com/mattdikos</a>',
    '  email    <a href="mailto:mattdikos@gmail.com">mattdikos@gmail.com</a>',
  ],

  // --- shell-ish -----------------------------------------------------------
  pwd: () => ["/home/matus"],

  ls: (args) => {
    const visible = Object.keys(files).filter((f) => !f.startsWith("."));
    const list = args.includes("-a") ? [".", "..", ...Object.keys(files)] : visible;
    return [list.join("  ")];
  },

  cat: (args) => {
    if (!args.length) return ["usage: cat <file>"];
    const out = [];
    for (const f of args) {
      const fn = files[f];
      if (fn) out.push(...fn());
      else out.push(`cat: ${f}: No such file or directory`);
    }
    return out;
  },

  history: () => (history.length ? history.map((h, i) => `  ${i + 1}  ${h}`) : ["  (empty)"]),

  date: () => [new Date().toString()],
  echo: (args) => [args.join(" ")],
  clear: () => { term.replaceChildren(); return []; },

  // --- jokes -------------------------------------------------------------------
  sudo: () => ["matus is not in the sudoers file. This incident will be reported."],
  exit: () => ["there is no exit."],
  man: (args) => [args[0] ? `no manual entry for ${args[0]}. figure it out.` : "What manual page do you want?"],
  sl: () => { train(); return ['<span class="dim">(you typed \'sl\'. did you mean \'ls\'?)</span>']; },

  ducky: (args) => {
    const on = args[0] !== "off";
    if (window.__duck) {
      window.__duck.set(on);
      if (on) setTimeout(() => window.__duck.fact && window.__duck.fact(), 400);
    }
    return [on ? "🦆" : "ducky waddles off. (`ducky` to bring him back)"];
  },
  duck: (args) => commands.ducky(args),
};

const files = {
  "about.txt": () => commands.about(),
  "school.txt": () => commands.school(),
  "contact.txt": () => commands.contact(),
  ".you_found_me": () => ["quack. nothing here. go outside."],
};

const HIDDEN = new Set(["sl", "exit", "man", "duck"]);

const PROMPT = "~$";
const HINTS = ["about", "school", "contact", "help"];

const term = document.getElementById("term");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const names = () => Object.keys(commands).sort();

function train() {
  const wrap = line("line train");
  const car = document.createElement("pre");
  car.className = "loco";
  car.textContent = [
    "        _____",
    "  _____|   |_____",
    " |  _ _ _ _ _ _  |___",
    " |_(_)_(_)___(_)_(_)_|",
    "   (o)         (o) ",
  ].join("\n");
  wrap.append(car);
  car.addEventListener("animationend", () => wrap.remove());
  setTimeout(() => wrap.remove(), 4000); // fallback if animation never fires
}

const history = [];
let hi = 0;

function line(cls, html) {
  const d = document.createElement("div");
  d.className = cls;
  if (html !== undefined) d.innerHTML = html;
  term.append(d);
  return d;
}

function promptSpan() {
  const s = document.createElement("span");
  s.className = "prompt";
  s.textContent = PROMPT;
  return s;
}

async function typeInto(node, text) {
  for (const ch of text) {
    node.append(ch);
    await wait(38 + Math.random() * 55);
  }
}

function print(lines) {
  for (const l of lines || []) line("line out", l);
}

function scrollBottom() {
  window.scrollTo({ top: document.documentElement.scrollHeight });
}

function run(raw) {
  const input = raw.trim();
  if (input) { history.push(input); hi = history.length; }
  if (!input) return;
  const [name, ...args] = input.split(/\s+/);
  const fn = commands[name];
  print(fn ? fn(args) : [`command not found: ${name}`]);
  window.dispatchEvent(new CustomEvent("cmd", { detail: name }));
}

function submit(input) {
  const row = input.closest(".line");
  const val = input.value;
  input.disabled = true;
  row.classList.remove("iwrap");
  row.replaceChildren(promptSpan(), document.createTextNode(val));
  run(val);
  livePrompt();
}

function fillAndSubmit(cmd) {
  const input = term.querySelector("input.cmd:not([disabled])");
  if (input) { input.value = cmd; submit(input); }
}

function livePrompt() {
  const row = line("line iwrap");
  row.append(promptSpan());

  const mirror = document.createElement("span");
  mirror.className = "mirror";
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  cursor.setAttribute("aria-hidden", "true");
  const ghost = document.createElement("span");
  ghost.className = "ghost";
  ghost.setAttribute("aria-hidden", "true");
  const input = document.createElement("input");
  input.className = "cmd";
  input.setAttribute("autocomplete", "off");
  input.setAttribute("autocapitalize", "off");
  input.setAttribute("spellcheck", "false");
  input.setAttribute("aria-label", "terminal input");

  row.append(mirror, cursor, ghost, input);
  input.focus();
  scrollBottom();

  function refresh() {
    const v = input.value;
    mirror.textContent = v;
    let g = "";
    if (v && !v.includes(" ")) {
      const m = names().find((c) => c.startsWith(v) && c !== v);
      if (m) g = m.slice(v.length);
    }
    ghost.textContent = g;
  }

  function acceptGhost() {
    if (!ghost.textContent) return false;
    input.value += ghost.textContent;
    refresh();
    return true;
  }

  input.addEventListener("input", refresh);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      submit(input);
    } else if (e.key === "Tab") {
      e.preventDefault();
      acceptGhost();
    } else if (e.key === "ArrowRight") {
      if (input.selectionStart === input.value.length && acceptGhost()) e.preventDefault();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (hi > 0) { hi--; input.value = history[hi]; refresh(); }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hi < history.length - 1) { hi++; input.value = history[hi]; }
      else { hi = history.length; input.value = ""; }
      refresh();
    }
  });
}

document.addEventListener("click", (e) => {
  if (e.target.closest(".hint")) return;
  const el = term.querySelector("input.cmd:not([disabled])");
  if (el && !window.getSelection().toString()) el.focus();
});

function hintBar() {
  const row = line("line dim");
  row.append("try: ");
  HINTS.forEach((c, i) => {
    if (i) row.append(" · ");
    const s = document.createElement("span");
    s.className = "hint";
    s.textContent = c;
    s.addEventListener("click", () => fillAndSubmit(c));
    row.append(s);
  });
}

async function main() {
  for (const l of reduce ? [] : boot.lines) {
    line("line dim", l);
    await wait(90);
  }
  const row = line("line");
  row.append(promptSpan());
  if (reduce) row.append(document.createTextNode(boot.cmd.cmd));
  else { await typeInto(row, boot.cmd.cmd); await wait(160); }
  print(boot.cmd.out);
  if (!reduce) await wait(200);

  hintBar();
  livePrompt();
}

main();
