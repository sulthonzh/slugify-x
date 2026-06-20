#!/usr/bin/env node
/**
 * slugify-x CLI
 */

import { slugify, toCase, splitWords, isSlug, truncateSlug, CaseType } from './index.js';

const { VERSION } = require('./index.js');

const args = process.argv.slice(2);

function help(): void {
  console.log(`
slugify-x — URL slug generator and case conversion

Usage:
  slugify-x <text>                     Generate a slug
  slugify-x <text> --sep <sep>         Use custom separator
  slugify-x <text> --max <n>           Max length
  slugify-x <text> --no-lower          Preserve case
  slugify-x <text> --no-emoji          Strip emojis
  slugify-x case <type> <text>         Convert case
  slugify-x words <text>               Split into words
  slugify-x check <text>               Check if valid slug
  slugify-x truncate <slug> <max>      Truncate slug
  slugify-x demo                       Show examples

Case types: camel, pascal, snake, kebab, constant, dot, path, title, sentence

Examples:
  slugify-x "Hello, World!"
  slugify-x "Café Résumé" --sep _
  slugify-x "Yönetim Paneli" --no-emoji
  slugify-x case camel "hello world foo"
  slugify-x case snake "HelloWorld"
`);
}

function demo(): void {
  const examples = [
    'Hello, World!',
    'Café Résumé ☕',
    'héllo wörld — test',
    'My Article Title #1',
    'fooBarBaz',
    'XMLHttpRequest',
    'version 2.0 release',
  ];

  console.log('═══ slugify-x demo ═══\n');

  console.log('─ Slugify ─');
  for (const ex of examples) {
    console.log(`  "${ex}" → "${slugify(ex)}"`);
  }

  console.log('\n─ Case Conversions ─');
  const caseEx = 'hello world foo bar';
  const types: CaseType[] = ['camel', 'pascal', 'snake', 'kebab', 'constant', 'dot', 'title', 'sentence'];
  for (const t of types) {
    console.log(`  ${t.padEnd(10)} → "${toCase(caseEx, t)}"`);
  }

  console.log('\n─ Word Splitting ─');
  const splitExamples = ['camelCaseExample', 'snake_case_example', 'kebab-case-example', 'PascalCaseExample'];
  for (const ex of splitExamples) {
    console.log(`  "${ex}" → [${splitWords(ex).map((w: string) => `"${w}"`).join(', ')}]`);
  }
}

function main(): void {
  if (args.length === 0 || args[0] === '-h' || args[0] === '--help' || args[0] === 'help') {
    help();
    return;
  }

  if (args[0] === 'version' || args[0] === '--version' || args[0] === '-V') {
    console.log(`slugify-x v${VERSION}`);
    return;
  }

  if (args[0] === 'demo') {
    demo();
    return;
  }

  if (args[0] === 'case') {
    const type = args[1] as CaseType;
    const text = args.slice(2).join(' ');
    if (!type || !text) {
      console.error('Usage: slugify-x case <type> <text>');
      process.exit(1);
    }
    console.log(toCase(text, type));
    return;
  }

  if (args[0] === 'words') {
    const text = args.slice(1).join(' ');
    console.log(JSON.stringify(splitWords(text)));
    return;
  }

  if (args[0] === 'check') {
    const text = args.slice(1).join(' ');
    console.log(isSlug(text));
    return;
  }

  if (args[0] === 'truncate') {
    const slug = args[1];
    const max = parseInt(args[2] || '0', 10);
    if (!slug || !max) {
      console.error('Usage: slugify-x truncate <slug> <maxLength>');
      process.exit(1);
    }
    console.log(truncateSlug(slug, max));
    return;
  }

  // Default: slugify
  const text = args.filter((a) => !a.startsWith('--')).join(' ');
  const opts: { separator?: string; lower?: boolean; removeEmojis?: boolean; maxLength?: number } = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--sep' && args[i + 1]) {
      opts.separator = args[++i];
    } else if (args[i] === '--max' && args[i + 1]) {
      opts.maxLength = parseInt(args[++i], 10);
    } else if (args[i] === '--no-lower') {
      opts.lower = false;
    } else if (args[i] === '--no-emoji') {
      opts.removeEmojis = true;
    }
  }

  if (!text) {
    console.error('Error: no text provided');
    process.exit(1);
  }

  console.log(slugify(text, opts));
}

main();
