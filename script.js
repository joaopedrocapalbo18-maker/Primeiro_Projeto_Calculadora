
const display = document.getElementById("display");
const expressionDisplay = document.getElementById("expression");
const keys = document.getElementById("keys");
const historyList = document.getElementById("history");
const clearHistoryButton = document.getElementById("clearHistory");
const themeToggle = document.getElementById("themeToggle");

const THEME_KEY = "calculator-theme";
const HISTORY_KEY = "calculator-history";

let expression = "";
let justCalculated = false;
let history = loadHistory();

// ==============================
// TEMA CLARO E ESCURO
// ==============================

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  const isDark = theme === "dark";

  themeToggle.innerHTML = isDark
    ? "☀️ <span>Tema claro</span>"
    : "🌙 <span>Tema escuro</span>";

  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Mudar para tema claro" : "Mudar para tema escuro"
  );

  themeToggle.setAttribute("aria-pressed", String(isDark));
}

function loadTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_KEY);

    applyTheme(savedTheme === "dark" ? "dark" : "light");
  } catch {
    applyTheme("light");
  }
}

themeToggle.addEventListener("click", () => {
  const currentTheme =
    document.documentElement.getAttribute("data-theme");

  const newTheme = currentTheme === "dark" ? "light" : "dark";

  applyTheme(newTheme);

  try {
    localStorage.setItem(THEME_KEY, newTheme);
  } catch {
    // O tema continua funcionando mesmo sem armazenamento.
  }
});

// ==============================
// FORMATAÇÃO DOS NÚMEROS
// ==============================

function formatNumber(number) {
  if (!Number.isFinite(number)) {
    return "Erro";
  }

  const rounded = Number(number.toPrecision(12));

  return rounded.toLocaleString("pt-BR", {
    maximumFractionDigits: 10,
  });
}

function formatExpression(value) {
  return value
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/-/g, "−")
    .replace(/\./g, ",");
}

function updateDisplay() {
  const lastNumber = expression.match(
    /(?:^|[+\-*/])(-?\d*\.?\d*)$/
  );

  let currentValue = "0";

  if (expression) {
    const match = expression.match(
      /(?:^|[+\-*/])(\d*\.?\d*)$/
    );

    if (match && match[1] !== "") {
      currentValue = match[1];
    } else if (/[+\-*/]$/.test(expression)) {
      currentValue = "0";
    } else {
      currentValue = expression;
    }
  }

  if (currentValue !== "Erro" && currentValue !== "") {
    const numericValue = Number(currentValue);

    display.textContent =
      currentValue === "." || currentValue === "-."
        ? "0,"
        : currentValue.includes(".")
          ? currentValue.replace(".", ",")
          : formatNumber(numericValue);
  } else {
    display.textContent = "0";
  }

  expressionDisplay.textContent = formatExpression(expression);

  document.querySelectorAll(".keys .op").forEach((button) => {
    button.classList.toggle(
      "active",
      expression.endsWith(button.dataset.operator)
    );
  });
}

// ==============================
// INTERPRETADOR MATEMÁTICO
// Respeita a prioridade das operações
// e não utiliza eval().
// ==============================

function calculate(source) {
  const input = source.replace(/\s/g, "");
  let position = 0;

  function parseExpression() {
    let result = parseTerm();

    while (position < input.length) {
      const operator = input[position];

      if (operator !== "+" && operator !== "-") {
        break;
      }

      position++;

      const right = parseTerm();

      result = operator === "+"
        ? result + right
        : result - right;
    }

    return result;
  }

  function parseTerm() {
    let result = parseUnary();

    while (position < input.length) {
      const operator = input[position];

      if (operator !== "*" && operator !== "/") {
        break;
      }

      position++;

      const right = parseUnary();

      if (operator === "/" && right === 0) {
        throw new Error("Divisão por zero");
      }

      result = operator === "*"
        ? result * right
        : result / right;
    }

    return result;
  }

  function parseUnary() {
    if (input[position] === "+") {
      position++;
      return parseUnary();
    }

    if (input[position] === "-") {
      position++;
      return -parseUnary();
    }

    return parseNumber();
  }

  function parseNumber() {
    const start = position;
    let dots = 0;

    while (position < input.length) {
      const character = input[position];

      if (character >= "0" && character <= "9") {
        position++;
      } else if (character === ".") {
        dots++;

        if (dots > 1) {
          throw new Error("Número inválido");
        }

        position++;
      } else {
        break;
      }
    }

    if (position === start) {
      throw new Error("Expressão inválida");
    }

    const number = Number(input.slice(start, position));

    if (!Number.isFinite(number)) {
      throw new Error("Número inválido");
    }

    return number;
  }

  if (!input) {
    throw new Error("Digite uma operação");
  }

  const result = parseExpression();

  if (position !== input.length) {
    throw new Error("Expressão inválida");
  }

  if (!Number.isFinite(result)) {
    throw new Error("Resultado inválido");
  }

  return Number(result.toPrecision(12));
}

// ==============================
// ENTRADA DE DÍGITOS
// ==============================

function appendDigit(digit) {
  if (justCalculated) {
    expression = "";
    justCalculated = false;
  }

  const match = expression.match(/(\d*\.?\d*)$/);
  const currentNumber = match ? match[1] : "";

  if (currentNumber.replace("-", "").length >= 15) {
    return;
  }

  if (currentNumber === "0") {
    expression = expression.slice(0, -1) + digit;
  } else {
    expression += digit;
  }

  updateDisplay();
}

function appendDecimal() {
  if (justCalculated) {
    expression = "";
    justCalculated = false;
  }

  const match = expression.match(/(\d*\.?\d*)$/);
  const currentNumber = match ? match[1] : "";

  if (currentNumber.includes(".")) {
    return;
  }

  if (!expression || /[+\-*/]$/.test(expression)) {
    expression += "0.";
  } else {
    expression += ".";
  }

  updateDisplay();
}

// ==============================
// OPERADORES
// ==============================

function appendOperator(operator) {
  if (!expression) {
    if (operator === "-") {
      expression = "-";
      updateDisplay();
    }

    return;
  }

  if (justCalculated) {
    justCalculated = false;
  }

  if (/[+\-*/.]$/.test(expression)) {
    if (expression.endsWith(".")) {
      expression += "0";
    } else if (/[+\-*/]$/.test(expression)) {
      // Permite, por exemplo, 5 * -2.
      if (operator === "-" && !expression.endsWith("-")) {
        expression += "-";
        updateDisplay();
        return;
      }

      expression = expression.replace(/[+\-*/]+$/, operator);
      updateDisplay();
      return;
    }
  }

  expression += operator;
  updateDisplay();
}

// ==============================
// SINAL E PORCENTAGEM
// ==============================

function toggleSign() {
  if (!expression || justCalculated) {
    expression = expression ? String(-Number(expression)) : "-";
    justCalculated = false;
    updateDisplay();
    return;
  }

  const match = expression.match(/(\d*\.?\d+)$/);

  if (!match) {
    if (/[+\-*/]$/.test(expression)) {
      expression += "-";
    }

    updateDisplay();
    return;
  }

  const start = match.index;
  const number = match[0];
  const before = expression.slice(0, start);

  if (before.endsWith("-")) {
    expression = before.slice(0, -1) + number;
  } else {
    expression = before + "-" + number;
  }

  updateDisplay();
}

function applyPercent() {
  if (!expression || justCalculated) {
    return;
  }

  const match = expression.match(/(\d*\.?\d+)$/);

  if (!match) {
    return;
  }

  const start = match.index;
  const value = Number(match[0]) / 100;

  expression =
    expression.slice(0, start) + String(value);

  updateDisplay();
}

// ==============================
// LIMPAR E APAGAR
// ==============================

function clearCalculator() {
  expression = "";
  justCalculated = false;

  display.textContent = "0";
  expressionDisplay.textContent = "";

  updateDisplay();
}

function backspace() {
  if (justCalculated) {
    clearCalculator();
    return;
  }

  expression = expression.slice(0, -1);
  updateDisplay();
}

// ==============================
// HISTÓRICO
// ==============================

function loadHistory() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(HISTORY_KEY) || "[]"
    );

    if (!Array.isArray(saved)) {
      return [];
    }

    return saved.filter(
      (item) =>
        item &&
        typeof item.expression === "string" &&
        typeof item.result === "number" &&
        Number.isFinite(item.result)
    ).slice(0, 30);
  } catch {
    return [];
  }
}

function saveHistory() {
  try {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(history)
    );
  } catch {
    // O histórico continua disponível durante esta sessão.
  }
}

function renderHistory() {
  historyList.replaceChildren();

  if (history.length === 0) {
    const empty = document.createElement("li");

    empty.className = "empty";
    empty.textContent = "Seus cálculos aparecerão aqui.";

    historyList.appendChild(empty);
    return;
  }

  history.forEach((item) => {
    const li = document.createElement("li");
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    li.setAttribute("aria-label", "Usar resultado novamente");

    const expr = document.createElement("span");
    expr.className = "h-expr";
    expr.textContent = formatExpression(item.expression) + " =";

    const result = document.createElement("span");
    result.className = "h-res";
    result.textContent = formatNumber(item.result);

    li.append(expr, result);

    function reuseResult() {
      expression = String(item.result);
      justCalculated = true;
      expressionDisplay.textContent =
        formatExpression(item.expression) + " =";
      display.textContent = formatNumber(item.result);
      updateDisplay();
    }

    li.addEventListener("click", reuseResult);

    li.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        reuseResult();
      }
    });

    historyList.appendChild(li);
  });
}

function addToHistory(source, result) {
  history.unshift({
    expression: source,
    result,
  });

  history = history.slice(0, 30);

  saveHistory();
  renderHistory();
}

clearHistoryButton.addEventListener("click", () => {
  history = [];
  saveHistory();
  renderHistory();
});

// ==============================
// CALCULAR RESULTADO
// ==============================

function calculateResult() {
  if (!expression || /[+\-*/.]$/.test(expression)) {
    return;
  }

  const source = expression;

  try {
    const result = calculate(source);

    addToHistory(source, result);

    expressionDisplay.textContent =
      formatExpression(source) + " =";

    expression = String(result);
    justCalculated = true;

    display.textContent = formatNumber(result);
    updateDisplay();

    // Preserva a expressão que originou o resultado.
    expressionDisplay.textContent =
      formatExpression(source) + " =";
  } catch (error) {
    display.textContent =
      error.message === "Divisão por zero"
        ? "Erro"
        : "Inválido";

    expressionDisplay.textContent =
      formatExpression(source);

    expression = "";
    justCalculated = true;
  }
}

// ==============================
// CLIQUES NAS TECLAS
// ==============================

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  if (button.dataset.digit !== undefined) {
    appendDigit(button.dataset.digit);
    return;
  }

  if (button.dataset.operator) {
    appendOperator(button.dataset.operator);
    return;
  }

  switch (button.dataset.action) {
    case "clear":
      clearCalculator();
      break;

    case "backspace":
      backspace();
      break;

    case "decimal":
      appendDecimal();
      break;

    case "sign":
      toggleSign();
      break;

    case "percent":
      applyPercent();
      break;

    case "equals":
      calculateResult();
      break;
  }
});

// ==============================
// TECLADO DO COMPUTADOR
// ==============================

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  const key = event.key;

  if (key >= "0" && key <= "9") {
    event.preventDefault();
    appendDigit(key);
    return;
  }

  if (["+", "-", "*", "/"].includes(key)) {
    event.preventDefault();
    appendOperator(key);
    return;
  }

  if (key === "." || key === ",") {
    event.preventDefault();
    appendDecimal();
    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculateResult();
    return;
  }

  if (key === "Backspace") {
    event.preventDefault();
    backspace();
    return;
  }

  if (key === "Escape" || key === "Delete") {
    event.preventDefault();
    clearCalculator();
  }

  if (key === "%") {
    event.preventDefault();
    applyPercent();
  }
});



loadTheme();
renderHistory();
updateDisplay();