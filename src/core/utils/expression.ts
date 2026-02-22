type Operator = '+' | '-' | '*' | '/';

const OPERATORS: Record<
  Operator,
  { precedence: number; apply: (a: number, b: number) => number }
> = {
  '+': { precedence: 1, apply: (a, b) => a + b },
  '-': { precedence: 1, apply: (a, b) => a - b },
  '*': { precedence: 2, apply: (a, b) => a * b },
  '/': { precedence: 2, apply: (a, b) => (b === 0 ? 0 : a / b) },
};

const isOperator = (ch: string): ch is Operator => ch in OPERATORS;

const tokenize = (expression: string): (number | Operator)[] => {
  const tokens: (number | Operator)[] = [];
  let numberBuffer = '';

  const flushNumber = () => {
    if (numberBuffer !== '') {
      tokens.push(parseFloat(numberBuffer));
      numberBuffer = '';
    }
  };

  for (const ch of expression) {
    if ((ch >= '0' && ch <= '9') || ch === '.') {
      numberBuffer += ch;
    } else if (isOperator(ch)) {
      flushNumber();
      tokens.push(ch);
    }
  }

  flushNumber();
  return tokens;
};

/**
 * Evaluates an arithmetic expression string.
 *
 * Supports +, -, *, / with correct operator precedence.
 * Uses shunting-yard algorithm.
 *
 * - Empty string → 0
 * - Trailing operator ("250+") → evaluates completed part (250)
 * - Division by zero → 0
 */
export const evaluateExpression = (expression: string): number => {
  const normalized = expression.replace(/,/g, '.').replace(/\s/g, '');

  if (normalized === '') return 0;

  let tokens = tokenize(normalized);

  if (tokens.length === 0) return 0;

  // Drop trailing operator (no right operand)
  while (tokens.length > 0 && typeof tokens[tokens.length - 1] === 'string') {
    tokens = tokens.slice(0, -1);
  }

  if (tokens.length === 0) return 0;

  // Shunting-yard: convert to postfix and evaluate in one pass
  const output: number[] = [];
  const operators: Operator[] = [];

  const applyTop = () => {
    const op = operators.pop()!;
    const b = output.pop() ?? 0;
    const a = output.pop() ?? 0;
    output.push(OPERATORS[op].apply(a, b));
  };

  for (const token of tokens) {
    if (typeof token === 'number') {
      output.push(token);
    } else {
      while (
        operators.length > 0 &&
        OPERATORS[operators[operators.length - 1]].precedence >=
          OPERATORS[token].precedence
      ) {
        applyTop();
      }
      operators.push(token);
    }
  }

  // Apply remaining operators
  while (operators.length > 0) {
    applyTop();
  }

  const result = output[0] ?? 0;
  return isNaN(result) || !isFinite(result) ? 0 : result;
};
