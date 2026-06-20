/**
 * slugify-x — Zero-dependency URL slug generator and string case conversion
 *
 * @module slugify-x
 */

// ─── Version ───────────────────────────────────────────────

/**
 * Current version of slugify-x.
 */
export const VERSION = '1.1.0';

// ─── Types ───────────────────────────────────────────────

export interface SlugifyOptions {
  /** Separator between words (default: '-') */
  separator?: string;
  /** Convert to lowercase (default: true) */
  lower?: boolean;
  /** Preserve letter case */
  preserveCase?: boolean;
  /** Maximum slug length (truncates at separator boundary) */
  maxLength?: number;
  /** Custom character replacements */
  replacement?: string;
  /** Custom replacements map (applied before normalization) */
  replacements?: Record<string, string>;
  /** Remove emojis and other non-letter symbols */
  removeEmojis?: boolean;
  /** Locale for transliteration hints (e.g. 'tr' for Turkish) */
  locale?: string;
}

// ─── Internal: Unicode Transliteration ────────────────────

/**
 * Transliterate Unicode characters to ASCII equivalents.
 * Uses NFKD normalization + strips combining marks,
 * plus a manual map for common cases not covered by NFKD.
 */
function transliterate(str: string): string {
  // NFKD normalization separates base chars from combining marks
  // (e.g. "é" → "e" + combining acute accent)
  const normalized = str.normalize('NFKD');

  // Strip combining diacritical marks (U+0300–U+036F, U+1AB0–U+1AFF, etc.)
  let result = normalized.replace(/[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/g, '');

  // Manual replacements for characters NFKD doesn't handle well
  const manualMap: Record<string, string> = {
    'ð': 'd', 'Ð': 'D',
    'ø': 'o', 'Ø': 'O',
    'þ': 'th', 'Þ': 'Th',
    'æ': 'ae', 'Æ': 'Ae',
    'ß': 'ss',
    'đ': 'd', 'Đ': 'D',
    'ħ': 'h', 'Ħ': 'H',
    'ı': 'i', 'İ': 'I',
    'ŀ': 'l', 'Ŀ': 'L',
    'ſ': 's',
    'ŧ': 't', 'Ŧ': 'T',
    'Ƶ': 'Z', 'ƶ': 'z',
    '₺': 'TL',
    '₹': 'Rs',
    '€': 'EUR',
    '£': 'GBP',
    '¥': 'JPY',
    '$': 'USD',
    '©': 'c',
    '®': 'r',
    '™': 'tm',
    '°': 'deg',
    '×': 'x',
    '÷': '/',
    '±': 'plusminus',
    '≈': 'approx',
    '…': '...',
    '—': '---',
    '–': '--',
    '\u2018': "'", '\u2019': "'",
    '\u201C': '"', '\u201D': '"',
    '№': 'No',
    '→': '->', '←': '<-', '↑': 'up', '↓': 'down',
    '✓': 'check', '✗': 'x',
    '★': 'star',
  };

  // Apply manual replacements
  result = result.replace(/[^ -~\t\n\r\u00A0-\uFFFF]/g, (char) => {
    return manualMap[char] ?? char;
  });

  // Also handle remaining non-ASCII letters via manual map pass
  for (const [from, to] of Object.entries(manualMap)) {
    result = result.split(from).join(to);
  }

  return result;
}

// ─── Internal: Emoji Removal ─────────────────────────────

/**
 * Remove emoji and other pictographic symbols.
 * Targets common Unicode emoji ranges.
 */
function stripEmojis(str: string): string {
  return str
    // Emoji and pictographs
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    // Dingbats
    .replace(/[\u2700-\u27BF]/gu, '')
    // Variation selectors
    .replace(/[\uFE00-\uFE0F]/gu, '')
    // Zero-width joiners and similar
    .replace(/[\u200D\u200C\u200E\u200F]/gu, '')
    // CJK and other pictographs might be kept or handled by transliterate
    .trim();
}

// ─── Internal: Word Splitting ────────────────────────────

/**
 * Split a string into words, handling various separators and casings.
 * Handles: spaces, hyphens, underscores, dots, slashes, camelCase, PascalCase, CONSTANT_CASE
 */
export function splitWords(str: string): string[] {
  if (!str || typeof str !== 'string') return [];

  // First, insert spaces at word boundaries
  const spaced = str
    // camelCase / PascalCase: insert space before uppercase letters following lowercase
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    // PascalCase followed by uppercase: "HTMLParser" → "HTML Parser"
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    // digit boundaries: "version2" → "version 2"
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-zA-Z])/g, '$1 $2');

  // Split on any non-alphanumeric character (handles -, _, ., /, space, etc.)
  const words = spaced
    .split(/[^a-zA-Z0-9]+/)
    .filter((w) => w.length > 0);

  return words;
}

// ─── Slugify ─────────────────────────────────────────────

/**
 * Convert a string into a URL-safe slug.
 *
 * @example
 * slugify('Hello, World!')        // → 'hello-world'
 * slugify('Café Résumé')          // → 'cafe-resume'
 * slugify('Héllo Wörld', { separator: '_' })  // → 'hello_world'
 * slugify('It's a Test', { maxLength: 10 })   // → 'its-a-test' → trimmed to 'its-a'
 * slugify('Hello!', { lower: false })         // → 'Hello'
 */
export function slugify(str: string, options: SlugifyOptions = {}): string {
  if (!str || typeof str !== 'string') return '';

  const {
    separator = '-',
    lower = true,
    preserveCase = false,
    maxLength,
    replacements = {},
    removeEmojis: stripEmoji = false,
  } = options;

  let result = str;

  // Apply custom replacements first
  for (const [from, to] of Object.entries(replacements)) {
    result = result.split(from).join(to);
  }

  // Transliterate Unicode to ASCII
  result = transliterate(result);

  // Remove emojis if requested
  if (stripEmoji) {
    result = stripEmojis(result);
  }

  // Convert to lowercase
  if (lower && !preserveCase) {
    result = result.toLowerCase();
  }

  // Escape separator for regex
  const escSep = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Replace any non-alphanumeric character with separator
  result = result.replace(/[^a-zA-Z0-9]+/g, separator);

  // Collapse consecutive separators (skip if separator is empty)
  if (separator.length > 0) {
    result = result.replace(new RegExp(`${escSep}+`, 'g'), separator);
  }

  // Trim leading/trailing separators
  if (separator.length > 0) {
    result = result.replace(new RegExp(`^${escSep}+|${escSep}+$`, 'g'), '');
  }

  // Apply max length — truncate at last separator within limit
  if (maxLength !== undefined && maxLength > 0 && result.length > maxLength) {
    result = result.substring(0, maxLength);
    // Trim any trailing partial word (cut at last separator)
    const lastSepIdx = result.lastIndexOf(separator);
    if (lastSepIdx > 0) {
      result = result.substring(0, lastSepIdx);
    }
    // Trim trailing separator after truncation
    if (separator.length > 0) {
      result = result.replace(new RegExp(`${escSep}+$`, 'g'), '');
    }
  }

  return result;
}

// ─── Case Conversions ────────────────────────────────────

/**
 * Capitalize the first character of a string.
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Lowercase the first character of a string.
 */
export function uncapitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Convert to camelCase.
 * @example toCamelCase('hello world') → 'helloWorld'
 */
export function toCamelCase(str: string): string {
  const words = splitWords(str);
  if (words.length === 0) return '';
  return words
    .map((word, i) => i === 0 ? word.toLowerCase() : capitalize(word.toLowerCase()))
    .join('');
}

/**
 * Convert to PascalCase.
 * @example toPascalCase('hello world') → 'HelloWorld'
 */
export function toPascalCase(str: string): string {
  const words = splitWords(str);
  return words.map((word) => capitalize(word.toLowerCase())).join('');
}

/**
 * Convert to snake_case.
 * @example toSnakeCase('Hello World') → 'hello_world'
 */
export function toSnakeCase(str: string): string {
  const words = splitWords(str);
  return words.map((w) => w.toLowerCase()).join('_');
}

/**
 * Convert to CONSTANT_CASE.
 * @example toConstantCase('Hello World') → 'HELLO_WORLD'
 */
export function toConstantCase(str: string): string {
  const words = splitWords(str);
  return words.map((w) => w.toUpperCase()).join('_');
}

/**
 * Convert to kebab-case.
 * @example toKebabCase('Hello World') → 'hello-world'
 */
export function toKebabCase(str: string): string {
  const words = splitWords(str);
  return words.map((w) => w.toLowerCase()).join('-');
}

/**
 * Convert to dot.case.
 * @example toDotCase('Hello World') → 'hello.world'
 */
export function toDotCase(str: string): string {
  const words = splitWords(str);
  return words.map((w) => w.toLowerCase()).join('.');
}

/**
 * Convert to path/case.
 * @example toPathCase('Hello World') → 'hello/world'
 */
export function toPathCase(str: string): string {
  const words = splitWords(str);
  return words.map((w) => w.toLowerCase()).join('/');
}

/**
 * Convert to Title Case.
 * @example toTitleCase('hello world') → 'Hello World'
 */
export function toTitleCase(str: string): string {
  const words = splitWords(str);
  return words.map((word) => capitalize(word.toLowerCase())).join(' ');
}

/**
 * Convert to Sentence case.
 * @example toSentenceCase('hello world') → 'Hello world'
 */
export function toSentenceCase(str: string): string {
  const words = splitWords(str);
  if (words.length === 0) return '';
  return [capitalize(words[0].toLowerCase()), ...words.slice(1).map((w) => w.toLowerCase())].join(' ');
}

// ─── Utilities ───────────────────────────────────────────

/**
 * Count the number of words in a string.
 */
export function countWords(str: string): number {
  return splitWords(str).length;
}

/**
 * Check if a string is a valid slug.
 */
export function isSlug(str: string, separator: string = '-'): string | boolean {
  if (!str) return false;
  const escSep = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^[a-z0-9]+(${escSep}[a-z0-9]+)*$`, 'i');
  return pattern.test(str);
}

/**
 * Truncate a slug to a maximum length without cutting words.
 */
export function truncateSlug(slug: string, maxLength: number, separator: string = '-'): string {
  if (slug.length <= maxLength) return slug;
  const escSep = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let truncated = slug.substring(0, maxLength);
  const lastSepIdx = truncated.lastIndexOf(separator);
  if (lastSepIdx > 0) {
    truncated = truncated.substring(0, lastSepIdx);
  }
  return truncated.replace(new RegExp(`${escSep}+$`, 'g'), '');
}

// ─── Case Conversion Map ─────────────────────────────────

export type CaseType =
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'constant'
  | 'dot'
  | 'path'
  | 'title'
  | 'sentence';

/**
 * Convert a string to the specified case type.
 */
export function toCase(str: string, type: CaseType): string {
  switch (type) {
    case 'camel': return toCamelCase(str);
    case 'pascal': return toPascalCase(str);
    case 'snake': return toSnakeCase(str);
    case 'kebab': return toKebabCase(str);
    case 'constant': return toConstantCase(str);
    case 'dot': return toDotCase(str);
    case 'path': return toPathCase(str);
    case 'title': return toTitleCase(str);
    case 'sentence': return toSentenceCase(str);
    default: return str;
  }
}

// ─── Exports Summary ─────────────────────────────────────

export default {
  slugify,
  splitWords,
  capitalize,
  uncapitalize,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  toConstantCase,
  toDotCase,
  toPathCase,
  toTitleCase,
  toSentenceCase,
  toCase,
  countWords,
  isSlug,
  truncateSlug,
  VERSION,
};
