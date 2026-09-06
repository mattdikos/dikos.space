/* Interactive terminal.
 *
 * `boot` is typed out on load. After that the prompt is live — type a command
 * and press Enter. Add commands to the `commands` map.
 */

const boot = [
  { cmd: "whoami", out: ["matus"] },
];

const commands = {
  help:   () => ["commands: " + Object.keys(commands).sort().join(", ")],
  whoami: () => ["matus"],
  date:   () => [new Date().toString()],
  echo:   (args) => [args.join(" ")],
  clear:  () => { term.replaceChildren(); return []; },
};

const PROMPT = "~$";
const term = document.getElementById("term");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
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

function livePrompt() {
  const row = line("line iwrap");
  row.append(promptSpan());

  const mirror = document.createElement("span");
  mirror.className = "mirror";
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  cursor.setAttribute("aria-hidden", "true");
  const input = document.createElement("input");
  input.className = "cmd";
  input.setAttribute("autocomplete", "off");
  input.setAttribute("autocapitalize", "off");
  input.setAttribute("spellcheck", "false");
  input.setAttribute("aria-label", "terminal input");

  row.append(mirror, cursor, input);
  input.focus();

  input.addEventListener("input", () => { mirror.textContent = input.value; });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const val = input.value;
      input.disabled = true;
      row.classList.remove("iwrap");
      row.replaceChildren(promptSpan(), document.createTextNode(val));
      run(val);
      livePrompt();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (hi > 0) { hi--; input.value = history[hi]; mirror.textContent = input.value; }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hi < history.length - 1) { hi++; input.value = history[hi]; }
      else { hi = history.length; input.value = ""; }
      mirror.textContent = input.value;
    }
  });
}

document.addEventListener("click", () => {
  const el = term.querySelector("input.cmd:not([disabled])");
  if (el && !window.getSelection().toString()) el.focus();
});

async function main() {
  for (const step of boot) {
    const row = line("line");
    row.append(promptSpan());
    if (reduce) row.append(document.createTextNode(step.cmd));
    else { await typeInto(row, step.cmd); await wait(160); }
    print(step.out);
    if (!reduce) await wait(220);
  }
  line("line dim", "type 'help'");
  livePrompt();
}

main();
