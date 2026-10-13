const MIN_FONT_SIZE = 24;
const MAX_FONT_SIZE = 100;
const LINE_HEIGHT_RATIO = 1.2;

/** Approximate advance widths (em) of bold system font with tabular figures */
const DIGIT_WIDTH = 0.62;
const SEPARATOR_WIDTH = 0.3;
const OPERATOR_WIDTH = 0.6;

const charWidth = (ch: string): number => {
  if (ch >= '0' && ch <= '9') return DIGIT_WIDTH;
  if (ch === ' ' || ch === ',' || ch === '.') return SEPARATOR_WIDTH;
  return OPERATOR_WIDTH;
};

const estimateWidthEm = (text: string): number =>
  [...text].reduce((sum, ch) => sum + charWidth(ch), 0);

/** Largest font size at which `text` fits into width × height on one line */
export const fitFontSize = (
  text: string,
  width: number,
  height: number
): number => {
  const byWidth = width / Math.max(estimateWidthEm(text), DIGIT_WIDTH);
  const byHeight = height / LINE_HEIGHT_RATIO;
  const size = Math.min(byWidth, byHeight, MAX_FONT_SIZE);
  return Math.max(MIN_FONT_SIZE, Math.floor(size));
};
