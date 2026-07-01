import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
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
} from '../src/index.ts';

// ─── slugify ─────────────────────────────────────────────

describe('slugify', () => {
  it('basic: converts spaces and punctuation', () => {
    assert.equal(slugify('Hello, World!'), 'hello-world');
    assert.equal(slugify('foo bar baz'), 'foo-bar-baz');
    assert.equal(slugify('  multiple   spaces  '), 'multiple-spaces');
  });

  it('handles empty and non-string', () => {
    assert.equal(slugify(''), '');
    assert.equal(slugify('   '), '');
  });

  it('removes special characters', () => {
    assert.equal(slugify('It\'s a Test!'), 'it-s-a-test');
    assert.equal(slugify('100% done'), '100-done');
    assert.equal(slugify('foo@bar.com'), 'foo-bar-com');
  });

  it('collapses consecutive separators', () => {
    assert.equal(slugify('a---b___c'), 'a-b-c');
    assert.equal(slugify('foo ! bar'), 'foo-bar');
  });

  it('transliterates Unicode (diacritics)', () => {
    assert.equal(slugify('Café'), 'cafe');
    assert.equal(slugify('Résumé'), 'resume');
    assert.equal(slugify('München'), 'munchen');
    assert.equal(slugify('Straße'), 'strasse');
  });

  it('transliterates special chars', () => {
    assert.equal(slugify('Æsop'), 'aesop');
    assert.equal(slugify('Øresund'), 'oresund');
    assert.equal(slugify('Señor'), 'senor');
    assert.equal(slugify('naïve'), 'naive');
  });

  it('removes emojis', () => {
    assert.equal(slugify('Hello 🎉 World', { removeEmojis: true }), 'hello-world');
  });

  it('removes emojis when removeEmojis is not explicitly set to false', () => {
    assert.equal(slugify('Hello 🎉 World'), 'hello-world'); // emojis stripped by default
  });

  it('custom separator', () => {
    assert.equal(slugify('Hello World', { separator: '_' }), 'hello_world');
    assert.equal(slugify('foo-bar', { separator: '.' }), 'foo.bar');
  });

  it('preserveCase option', () => {
    assert.equal(slugify('Hello World', { lower: false, preserveCase: true }), 'Hello-World');
  });

  it('maxLength truncates at word boundary', () => {
    assert.equal(slugify('Hello World Foo', { maxLength: 10 }), 'hello');
  });

  it('custom replacements', () => {
    assert.equal(slugify('C++ Programming', { replacements: { 'C++': 'cpp' } }), 'cpp-programming');
    assert.equal(slugify('.NET Core', { replacements: { '.NET': 'dotnet' } }), 'dotnet-core');
  });

  it('handles numbers', () => {
    assert.equal(slugify('version 2.0 release'), 'version-2-0-release');
  });

  it('handles mixed case input', () => {
    assert.equal(slugify('HeLLo WoRLd'), 'hello-world');
  });
});

// ─── splitWords ────────────────────────────────────────

describe('splitWords', () => {
  it('splits on spaces', () => {
    assert.deepEqual(splitWords('hello world'), ['hello', 'world']);
  });

  it('splits on hyphens and underscores', () => {
    assert.deepEqual(splitWords('hello-world'), ['hello', 'world']);
    assert.deepEqual(splitWords('hello_world'), ['hello', 'world']);
  });

  it('splits camelCase', () => {
    assert.deepEqual(splitWords('camelCase'), ['camel', 'Case']);
    assert.deepEqual(splitWords('helloWorld'), ['hello', 'World']);
  });

  it('splits PascalCase', () => {
    assert.deepEqual(splitWords('PascalCase'), ['Pascal', 'Case']);
  });

  it('splits CONSTANT_CASE', () => {
    assert.deepEqual(splitWords('CONSTANT_CASE'), ['CONSTANT', 'CASE']);
  });

  it('splits on dots and slashes', () => {
    assert.deepEqual(splitWords('hello.world'), ['hello', 'world']);
    assert.deepEqual(splitWords('hello/world'), ['hello', 'world']);
  });

  it('handles digit boundaries', () => {
    assert.deepEqual(splitWords('version2'), ['version', '2']);
    assert.deepEqual(splitWords('2foo'), ['2', 'foo']);
  });

  it('handles empty string', () => {
    assert.deepEqual(splitWords(''), []);
  });

  it('handles leading/trailing separators', () => {
    assert.deepEqual(splitWords('-hello-'), ['hello']);
  });
});

// ─── capitalize ────────────────────────────────────────

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    assert.equal(capitalize('hello'), 'Hello');
    assert.equal(capitalize('HELLO'), 'HELLO'); // only changes first char
  });

  it('handles empty string', () => {
    assert.equal(capitalize(''), '');
  });

  it('handles already capitalized', () => {
    assert.equal(capitalize('Hello'), 'Hello');
  });
});

// ─── uncapitalize ────────────────────────────────────

describe('uncapitalize', () => {
  it('lowercases first letter', () => {
    assert.equal(uncapitalize('Hello'), 'hello');
  });

  it('handles empty string', () => {
    assert.equal(uncapitalize(''), '');
  });
});

// ─── toCamelCase ─────────────────────────────────────

describe('toCamelCase', () => {
  it('from spaces', () => {
    assert.equal(toCamelCase('hello world'), 'helloWorld');
  });

  it('from kebab', () => {
    assert.equal(toCamelCase('hello-world'), 'helloWorld');
  });

  it('from snake', () => {
    assert.equal(toCamelCase('hello_world'), 'helloWorld');
  });

  it('from PascalCase', () => {
    assert.equal(toCamelCase('HelloWorld'), 'helloWorld');
  });

  it('from mixed', () => {
    assert.equal(toCamelCase('hello-world-foo'), 'helloWorldFoo');
  });

  it('handles numbers', () => {
    assert.equal(toCamelCase('version 2'), 'version2');
  });

  it('empty string', () => {
    assert.equal(toCamelCase(''), '');
  });
});

// ─── toPascalCase ────────────────────────────────────

describe('toPascalCase', () => {
  it('from spaces', () => {
    assert.equal(toPascalCase('hello world'), 'HelloWorld');
  });

  it('from kebab', () => {
    assert.equal(toPascalCase('hello-world'), 'HelloWorld');
  });

  it('from snake', () => {
    assert.equal(toPascalCase('hello_world'), 'HelloWorld');
  });

  it('empty string', () => {
    assert.equal(toPascalCase(''), '');
  });
});

// ─── toSnakeCase ─────────────────────────────────────

describe('toSnakeCase', () => {
  it('from spaces', () => {
    assert.equal(toSnakeCase('hello world'), 'hello_world');
  });

  it('from camelCase', () => {
    assert.equal(toSnakeCase('helloWorld'), 'hello_world');
  });

  it('from kebab', () => {
    assert.equal(toSnakeCase('hello-world'), 'hello_world');
  });
});

// ─── toKebabCase ─────────────────────────────────────

describe('toKebabCase', () => {
  it('from spaces', () => {
    assert.equal(toKebabCase('hello world'), 'hello-world');
  });

  it('from camelCase', () => {
    assert.equal(toKebabCase('helloWorld'), 'hello-world');
  });

  it('from snake', () => {
    assert.equal(toKebabCase('hello_world'), 'hello-world');
  });
});

// ─── toConstantCase ──────────────────────────────────

describe('toConstantCase', () => {
  it('from spaces', () => {
    assert.equal(toConstantCase('hello world'), 'HELLO_WORLD');
  });

  it('from camelCase', () => {
    assert.equal(toConstantCase('helloWorld'), 'HELLO_WORLD');
  });
});

// ─── toDotCase ────────────────────────────────────────

describe('toDotCase', () => {
  it('from spaces', () => {
    assert.equal(toDotCase('hello world'), 'hello.world');
  });

  it('from camelCase', () => {
    assert.equal(toDotCase('helloWorld'), 'hello.world');
  });
});

// ─── toPathCase ───────────────────────────────────────

describe('toPathCase', () => {
  it('from spaces', () => {
    assert.equal(toPathCase('hello world'), 'hello/world');
  });

  it('from camelCase', () => {
    assert.equal(toPathCase('helloWorld'), 'hello/world');
  });
});

// ─── toTitleCase ──────────────────────────────────────

describe('toTitleCase', () => {
  it('from spaces', () => {
    assert.equal(toTitleCase('hello world'), 'Hello World');
  });

  it('from camelCase', () => {
    assert.equal(toTitleCase('helloWorld'), 'Hello World');
  });
});

// ─── toSentenceCase ───────────────────────────────────

describe('toSentenceCase', () => {
  it('from spaces', () => {
    assert.equal(toSentenceCase('hello world'), 'Hello world');
  });

  it('from camelCase', () => {
    assert.equal(toSentenceCase('helloWorld'), 'Hello world');
  });
});

// ─── toCase ───────────────────────────────────────────

describe('toCase', () => {
  it('routes to correct function', () => {
    assert.equal(toCase('hello world', 'camel'), 'helloWorld');
    assert.equal(toCase('hello world', 'snake'), 'hello_world');
  });
});

// ─── countWords ───────────────────────────────────────

describe('countWords', () => {
  it('counts words in string', () => {
    assert.equal(countWords('hello world'), 2);
    assert.equal(countWords('hello-world'), 2);
    assert.equal(countWords('camelCase'), 2);
  });
});

// ─── isSlug ───────────────────────────────────────────

describe('isSlug', () => {
  it('valid slugs', () => {
    assert.equal(isSlug('hello-world'), true);
    assert.equal(isSlug('hello123'), true);
  });

  it('invalid slugs', () => {
    assert.equal(isSlug('Hello World'), false);
    assert.equal(isSlug('hello_world'), false);
  });

  it('custom separator', () => {
    assert.equal(isSlug('hello_world', '_'), true);
    assert.equal(isSlug('hello-world', '_'), false);
  });
});

// ─── truncateSlug ─────────────────────────────────────

describe('truncateSlug', () => {
  it('no truncation needed', () => {
    assert.equal(truncateSlug('short', 100), 'short');
  });

  it('truncates at word boundary', () => {
    assert.equal(truncateSlug('hello-world-foo', 10), 'hello');
    assert.equal(truncateSlug('a-b-c-d-e', 5), 'a-b');
  });

  it('exact length', () => {
    assert.equal(truncateSlug('hello', 5), 'hello');
  });
});

// ─── VERSION ───────────────────────────────────────────

import { VERSION } from '../src/index.ts';

describe('VERSION', () => {
  it('should export VERSION constant', () => {
    assert.ok(typeof VERSION === 'string');
    assert.ok(VERSION.length > 0);
  });

  it('should be 1.1.0', () => {
    assert.equal(VERSION, '1.1.0');
  });
});

// ─── CLI Version ───────────────────────────────────────

describe('CLI --version flag', () => {
  it('should accept --version flag', async () => {
    const result = (await import('child_process')).spawnSync('node', ['dist/src/cli.js', '--version'], { encoding: 'utf-8' });
    assert.equal(result.status, 0);
    assert.match(result.stdout, /1.1.0/);
  });

  it('should accept -V flag', async () => {
    const result = (await import('child_process')).spawnSync('node', ['dist/src/cli.js', '-V'], { encoding: 'utf-8' });
    assert.equal(result.status, 0);
    assert.match(result.stdout, /1.1.0/);
  });

  it('should accept version command', async () => {
    const result = (await import('child_process')).spawnSync('node', ['dist/src/cli.js', 'version'], { encoding: 'utf-8' });
    assert.equal(result.status, 0);
    assert.match(result.stdout, /1.1.0/);
  });
});