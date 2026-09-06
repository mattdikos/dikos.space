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
    "  load shell (zsh) … ok",
    "",
  ],
  cmd: { cmd: "whoami", out: ["matus"] },
};

const commands = {
  help: () => ["commands: " + names().join(", ")],

  whoami: () => ["matus"],

  about: () => [
    "matus — backend developer.",
    "i build small things that help. this site is a scratchpad;",
    "expect it to grow weird over time.",
    "",
    '<span class="dim">edit me: terminal.js → commands.about</span>',
  ],

  projects: () => [
    "nothing shipped publicly yet — check back.",
    "",
    "  misko    ig group-chat bot        (private)",
    '  <span class="dim">… edit terminal.js → commands.projects</span>',
  ],

  contact: () => [
    '  github   <a href="https://github.com/mattdikos">github.com/mattdikos</a>',
    '  email    <a href="mailto:mattdikos@gmail.com">mattdikos@gmail.com</a>',
  ],
  links: () => commands.contact(),

  neofetch: () => [
    '<span class="accent">╭───╮</span>  matus@dikos.space',
    '<span class="accent">│ ~ │</span>  ─────────────────',
    '<span class="accent">╰───╯</span>  role     backend developer',
    "       shell    zsh",
    "       editor   pycharm",
    "       host     dikos.space",
    "       www      github.com/mattdikos",
  ],

  date: () => [new Date().toString()],
  echo: (args) => [args.join(" ")],
  clear: () => { term.replaceChildren(); return []; },
};

const PROMPT = "~$";
const HINTS = ["about", "projects", "contact", "help"];

const term = document.getElementById("term");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const names = () => Object.keys(commands).sort();

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

function run(raw) {
  const input = raw.trim();
  if (input) { history.push(input); hi = history.length; }
  if (!input) return;
  const [name, ...args] = input.split(/\s+/);
  const fn = commands[name];
  print(fn ? fn(args) : [`zsh: command not found: ${name}`]);
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
