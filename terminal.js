/* Terminal typing animation.
 *
 * To add more later, append to `steps`. Each step is one command + its output:
 *   { cmd: "cat about.txt", out: ["line one", "line two"] }
 * Use { out: [...] } with no cmd for plain text, and raw HTML is allowed in
 * out lines (e.g. links). Keep it simple.
 */

const steps = [
  { cmd: "whoami", out: ["matus"] },
];

const PROMPT = "~$";
const term = document.getElementById("term");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function el(cls, html) {
  const d = document.createElement("div");
  d.className = cls;
  if (html !== undefined) d.innerHTML = html;
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

async function run() {
  for (const step of steps) {
    if ("cmd" in step) {
      const line = el("line");
      line.append(promptSpan());
      term.append(line);
      const typed = document.createTextNode("");
      line.append(typed);
      if (reduce) {
        typed.textContent = step.cmd;
      } else {
        await typeInto(line, step.cmd);
        await wait(160);
      }
    }
    for (const out of step.out || []) {
      term.append(el("line out", out));
      if (!reduce) await wait(90);
    }
    if (!reduce) await wait(260);
  }

  // trailing live prompt
  const last = el("line");
  last.append(promptSpan());
  const cur = document.createElement("span");
  cur.className = "cursor";
  cur.setAttribute("aria-hidden", "true");
  last.append(cur);
  term.append(last);
}

run();
