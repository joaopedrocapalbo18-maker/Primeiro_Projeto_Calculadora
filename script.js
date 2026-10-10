(() => {
  const SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷", "^": "^" };
  const exprEl = document.getElementById("expr");
  const valueEl = document.getElementById("value");
  const historyEl = document.getElementById("history");
  const emptyEl = document.getElementById("empty");

  let current = "0";      // número sendo digitado
  let previous = null;    // operando anterior
  let operator = null;    // operador pendente
  let fresh = false;      // próximo dígito começa novo número
  let error = false;
  const history = [];

  const fmt = (s) => String(s).replace(".", ",");
  const clean = (n) => Number.parseFloat(n.toPrecision(12));

  function compute(a, op, b) {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b === 0 ? NaN : a / b;
      case "^": return Math.pow(a, b);
    }
  }

  function render() {
    valueEl.textContent = error ? "Erro" : fmt(current);
    const len = valueEl.textContent.length;
    valueEl.style.fontSize = len > 14 ? "1.5rem" : len > 10 ? "2rem" : "2.6rem";
    exprEl.textContent = operator ? `${fmt(previous)} ${SYMBOLS[operator]}` : "\u00A0";
    document.querySelectorAll(".op").forEach(b =>
      b.classList.toggle("active", b.dataset.op === operator && fresh));
  }

  function renderHistory() {
    historyEl.innerHTML = "";
    emptyEl.hidden = history.length > 0;
    history.forEach(h => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="h-expr"></span><span class="h-res"></span>`;
      li.firstChild.textContent = h.expr;
      li.lastChild.textContent = "= " + fmt(h.result);
      li.addEventListener("click", () => { current = String(h.result); previous = operator = null; fresh = true; error = false; render(); });
      historyEl.appendChild(li);
    });
  }

  function inputNum(d) {
    if (error) reset();
    if (fresh || current === "0") current = d; else if (current.replace(/[-.]/g, "").length < 15) current += d;
    fresh = false; render();
  }
  function inputDot() {
    if (error) reset();
    if (fresh) { current = "0"; fresh = false; }
    if (!current.includes(".")) current += ".";
    render();
  }
  function setOp(op) {
    if (error) return;
    if (operator && !fresh) calculate(true);
    previous = parseFloat(current); operator = op; fresh = true; render();
  }
  function calculate(chain = false) {
    if (error || operator === null) return;
    const a = previous, b = parseFloat(current);
    const raw = compute(a, operator, b);
    if (!Number.isFinite(raw)) { error = true; operator = previous = null; render(); return; }
    const result = clean(raw);
    history.unshift({ expr: `${fmt(a)} ${SYMBOLS[operator]} ${fmt(b)}`, result });
    if (history.length > 30) history.pop();
    current = String(result);
    if (!chain) { operator = previous = null; }
    fresh = true; render(); renderHistory();
  }
  function reset() { current = "0"; previous = operator = null; fresh = false; error = false; render(); }
  function back() {
    if (error || fresh) return;
    current = current.length > 1 && !(current.length === 2 && current[0] === "-") ? current.slice(0, -1) : "0";
    render();
  }
  function sign() {
    if (error || current === "0") return;
    current = current.startsWith("-") ? current.slice(1) : "-" + current; render();
  }

  document.querySelector(".keys").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.num) inputNum(b.dataset.num);
    else if (b.dataset.op) setOp(b.dataset.op);
    else ({ clear: reset, back, sign, dot: inputDot, equals: () => calculate() })[b.dataset.action]?.();
  });

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (/^\d$/.test(k)) inputNum(k);
    else if (k === "." || k === ",") inputDot();
    else if (["+", "-", "*", "/", "^"].includes(k)) { e.preventDefault(); setOp(k); }
    else if (k === "Enter" || k === "=") { e.preventDefault(); calculate(); }
    else if (k === "Backspace") back();
    else if (k === "Escape" || k.toLowerCase() === "c") reset();
  });

  document.getElementById("clearHist").addEventListener("click", () => { history.length = 0; renderHistory(); });
  render(); renderHistory();
})();
