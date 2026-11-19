/**
 * Tiny, dependency-free syntax highlighter for the illustrative code shown on the site.
 * It is intentionally small: it only needs to handle the predefined snippets we render.
 */
export type Lang = "python" | "cpp";
export type Token = { text: string; cls: string };

const KEYWORDS: Record<Lang, Set<string>> = {
  python: new Set([
    "def", "while", "for", "in", "if", "elif", "else", "return", "import", "from",
    "and", "or", "not", "break", "continue", "pass", "lambda", "class", "with", "as",
  ]),
  cpp: new Set([
    "for", "while", "if", "else", "return", "void", "int", "bool", "auto", "const",
    "using", "namespace", "std", "include", "struct", "class", "break", "continue",
  ]),
};
const TYPES: Record<Lang, Set<string>> = {
  python: new Set([]),
  cpp: new Set(["int", "void", "bool", "auto", "vector", "string"]),
};
const BOOLS = new Set(["True", "False", "None", "true", "false", "nullptr"]);
const BUILTINS: Record<Lang, Set<string>> = {
  python: new Set(["print", "range", "len", "input", "sum", "max", "min", "round", "str", "int"]),
  cpp: new Set(["swap", "cout", "endl", "main"]),
};

const RULES: { re: RegExp; cls: (m: string, lang: Lang) => string }[] = [
  { re: /^#include\s*<[^>]+>/, cls: () => "tok-pp" },
  { re: /^#.*$/, cls: (_m, lang) => (lang === "python" ? "tok-com" : "tok-pp") },
  { re: /^\/\/.*$/, cls: () => "tok-com" },
  { re: /^f?"(?:[^"\\]|\\.)*"?/, cls: () => "tok-str" },
  { re: /^f?'(?:[^'\\]|\\.)*'?/, cls: () => "tok-str" },
  { re: /^\d+(?:\.\d+)?/, cls: () => "tok-num" },
  { re: /^[A-Za-z_][A-Za-z0-9_]*/, cls: () => "" }, // resolved below
  { re: /^(?:<<|>>|==|!=|<=|>=|\+=|-=|\*=|\/=|\+\+|--|[+\-*/%=<>!&|])/, cls: () => "tok-op" },
  { re: /^\s+/, cls: () => "" },
  { re: /^./, cls: () => "" },
];

function classifyWord(word: string, rest: string, lang: Lang): string {
  if (BOOLS.has(word)) return "tok-bool";
  if (TYPES[lang].has(word)) return "tok-type";
  if (KEYWORDS[lang].has(word)) return "tok-kw";
  if (BUILTINS[lang].has(word) || /^\s*\(/.test(rest)) return "tok-fn";
  return "tok-var";
}

export function highlightLine(line: string, lang: Lang): Token[] {
  const tokens: Token[] = [];
  let rest = line;
  while (rest.length) {
    for (const rule of RULES) {
      const m = rule.re.exec(rest);
      if (!m) continue;
      const text = m[0];
      const after = rest.slice(text.length);
      const cls = /^[A-Za-z_]/.test(text) && rule.re.source.startsWith("^[A-Za-z_]")
        ? classifyWord(text, after, lang)
        : rule.cls(text, lang);
      const prev = tokens[tokens.length - 1];
      if (prev && prev.cls === cls) prev.text += text;
      else tokens.push({ text, cls });
      rest = after;
      break;
    }
  }
  return tokens;
}

export function highlight(code: string, lang: Lang): Token[][] {
  return code.split("\n").map((l) => highlightLine(l, lang));
}
