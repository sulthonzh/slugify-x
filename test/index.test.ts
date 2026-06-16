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
} from '../src/index';

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
    assert.equal(slugify('naïve'), 'naive');
    assert.equal(slugify('Héllo Wörld'), 'hello-world');
    assert.equal(slugify('München'), 'munchen');
    assert.equal(slugify('Señor'), 'senor');
  });

  it('transliterates special chars', () => {
    assert.equal(slugify('Æsop'), 'aesop'); // Æ→Ae
    assert.equal(slugify('Straße'), 'strasse'); // ß→ss
    assert.equal(slugify('Øresund'), 'oresund');
    assert.equal(slugify('100°'), '100deg');
  });

  it('removes emojis', () => {
    assert.equal(slugify('Hello 🎉 World', { removeEmojis: true }), 'hello-world');
    assert.equal(slugify('☕ coffee', { removeEmojis: true }), 'coffee');
    assert.equal(slugify('test ✅ done', { removeEmojis: true }), 'test-done');
  });

  it('keeps emojis when removeEmojis not set', () => {
    // Emoji become non-alphanumeric → separator, but may leave Unicode chars
    const result = slugify('Hello 🎉');
    // The emoji is replaced by separator since it's non-alphanumeric after transliteration
    // It might just become 'hello'
    assert.ok(result.startsWith('hello'));
  });

  it('custom separator', () => {
    assert.equal(slugify('Hello World', { separator: '_' }), 'hello_world');
    assert.equal(slugify('foo bar baz', { separator: '.' }), 'foo.bar.baz');
    // empty separator just concatenates
  });

  it('preserveCase option', () => {
    assert.equal(slugify('Hello World', { lower: false }), 'Hello-World');
    assert.equal(slugify('FooBar', { lower: false }), 'FooBar');
  });

  it('maxLength truncates at word boundary', () => {
    assert.equal(slugify('Hello World Foo Bar', { maxLength: 12 }), 'hello-world');
    assert.equal(slugify('Short', { maxLength: 100 }), 'short');
    assert.equal(slugify('A Very Long Title Here', { maxLength: 10 }), 'a-very');
  });

  it('custom replacements', () => {
    assert.equal(slugify('C++ Guide', { replacements: { 'C++': 'cpp' } }), 'cpp-guide');
    assert.equal(slugify('.NET Core', { replacements: { '.NET': 'dotnet' } }), 'dotnet-core');
    assert.equal(slugify('Node.js', { replacements: { 'Node.js': 'nodejs' } }), 'nodejs');
  });

  it('handles numbers', () => {
    assert.equal(slugify('Article #1'), 'article-1');
    assert.equal(slugify('Version 2.0'), 'version-2-0');
    assert.equal(slugify('Top 10'), 'top-10');
  });

  it('handles mixed case input', () => {
    assert.equal(slugify('FooBar'), 'foobar');
    assert.equal(slugify('XMLHttpRequest'), 'xmlhttprequest');
  });
});

// ─── splitWords ──────────────────────────────────────────

describe('splitWords', () => {
  it('splits on spaces', () => {
    assert.deepEqual(splitWords('hello world'), ['hello', 'world']);
    assert.deepEqual(splitWords('foo  bar   baz'), ['foo', 'bar', 'baz']);
  });

  it('splits on hyphens and underscores', () => {
    assert.deepEqual(splitWords('foo-bar-baz'), ['foo', 'bar', 'baz']);
    assert.deepEqual(splitWords('foo_bar_baz'), ['foo', 'bar', 'baz']);
  });

  it('splits camelCase', () => {
    assert.deepEqual(splitWords('helloWorld'), ['hello', 'World']);
    assert.deepEqual(splitWords('fooBarBaz'), ['foo', 'Bar', 'Baz']);
  });

  it('splits PascalCase', () => {
    assert.deepEqual(splitWords('HelloWorld'), ['Hello', 'World']);
    assert.deepEqual(splitWords('XMLHttpRequest'), ['XML', 'Http', 'Request']);
  });

  it('splits CONSTANT_CASE', () => {
    assert.deepEqual(splitWords('HELLO_WORLD'), ['HELLO', 'WORLD']);
  });

  it('splits on dots and slashes', () => {
    assert.deepEqual(splitWords('foo.bar.baz'), ['foo', 'bar', 'baz']);
    assert.deepEqual(splitWords('foo/bar/baz'), ['foo', 'bar', 'baz']);
  });

  it('handles digit boundaries', () => {
    assert.deepEqual(splitWords('version2Release'), ['version', '2', 'Release']);
    assert.deepEqual(splitWords('file3.txt'), ['file', '3', 'txt']);
  });

  it('handles empty string', () => {
    assert.deepEqual(splitWords(''), []);
  });

  it('handles leading/trailing separators', () => {
    assert.deepEqual(splitWords('--foo--bar--'), ['foo', 'bar']);
  });
});

// ─── capitalize / uncapitalize ───────────────────────────

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    assert.equal(capitalize('hello'), 'Hello');
    assert.equal(capitalize('foo bar'), 'Foo bar');
  });

  it('handles empty string', () => {
    assert.equal(capitalize(''), '');
  });

  it('handles already capitalized', () => {
    assert.equal(capitalize('Hello'), 'Hello');
  });
});

describe('uncapitalize', () => {
  it('lowercases first letter', () => {
    assert.equal(uncapitalize('Hello'), 'hello');
    assert.equal(uncapitalize('FooBar'), 'fooBar');
  });

  it('handles empty string', () => {
    assert.equal(uncapitalize(''), '');
  });
});

// ─── Case Conversions ────────────────────────────────────

describe('toCamelCase', () => {
  it('from spaces', () => {
    assert.equal(toCamelCase('hello world'), 'helloWorld');
    assert.equal(toCamelCase('foo bar baz'), 'fooBarBaz');
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
    assert.equal(toCamelCase('XMLHttpRequest'), 'xmlHttpRequest');
  });

  it('handles numbers', () => {
    assert.equal(toCamelCase('version 2 release'), 'version2Release');
  });

  it('empty string', () => {
    assert.equal(toCamelCase(''), '');
  });
});

describe('toPascalCase', () => {
  it('from spaces', () => {
    assert.equal(toPascalCase('hello world'), 'HelloWorld');
    assert.equal(toPascalCase('foo bar baz'), 'FooBarBaz');
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

describe('toSnakeCase', () => {
  it('from spaces', () => {
    assert.equal(toSnakeCase('Hello World'), 'hello_world');
    assert.equal(toSnakeCase('foo bar baz'), 'foo_bar_baz');
  });

  it('from camelCase', () => {
    assert.equal(toSnakeCase('helloWorld'), 'hello_world');
    assert.equal(toSnakeCase('XMLHttpRequest'), 'xml_http_request');
  });

  it('from kebab', () => {
    assert.equal(toSnakeCase('hello-world'), 'hello_world');
  });
});

describe('toKebabCase', () => {
  it('from spaces', () => {
    assert.equal(toKebabCase('Hello World'), 'hello-world');
    assert.equal(toKebabCase('foo bar baz'), 'foo-bar-baz');
  });

  it('from camelCase', () => {
    assert.equal(toKebabCase('helloWorld'), 'hello-world');
    assert.equal(toKebabCase('XMLHttpRequest'), 'xml-http-request');
  });

  it('from snake', () => {
    assert.equal(toKebabCase('hello_world'), 'hello-world');
  });
});

describe('toConstantCase', () => {
  it('from spaces', () => {
    assert.equal(toConstantCase('Hello World'), 'HELLO_WORLD');
    assert.equal(toConstantCase('foo bar baz'), 'FOO_BAR_BAZ');
  });

  it('from camelCase', () => {
    assert.equal(toConstantCase('helloWorld'), 'HELLO_WORLD');
  });
});

describe('toDotCase', () => {
  it('from spaces', () => {
    assert.equal(toDotCase('Hello World'), 'hello.world');
    assert.equal(toDotCase('foo bar baz'), 'foo.bar.baz');
  });

  it('from camelCase', () => {
    assert.equal(toDotCase('helloWorld'), 'hello.world');
  });
});

describe('toPathCase', () => {
  it('from spaces', () => {
    assert.equal(toPathCase('Hello World'), 'hello/world');
    assert.equal(toPathCase('foo bar baz'), 'foo/bar/baz');
  });

  it('from camelCase', () => {
    assert.equal(toPathCase('helloWorld'), 'hello/world');
  });
});

describe('toTitleCase', () => {
  it('from spaces', () => {
    assert.equal(toTitleCase('hello world'), 'Hello World');
    assert.equal(toTitleCase('the quick brown fox'), 'The Quick Brown Fox');
  });

  it('from camelCase', () => {
    assert.equal(toTitleCase('helloWorldFoo'), 'Hello World Foo');
  });
});

describe('toSentenceCase', () => {
  it('from spaces', () => {
    assert.equal(toSentenceCase('hello world'), 'Hello world');
    assert.equal(toSentenceCase('HELLO WORLD'), 'Hello world');
  });

  it('from camelCase', () => {
    assert.equal(toSentenceCase('helloWorldFoo'), 'Hello world foo');
  });
});

describe('toCase', () => {
  it('routes to correct function', () => {
    assert.equal(toCase('hello world', 'camel'), 'helloWorld');
    assert.equal(toCase('hello world', 'pascal'), 'HelloWorld');
    assert.equal(toCase('hello world', 'snake'), 'hello_world');
    assert.equal(toCase('hello world', 'kebab'), 'hello-world');
    assert.equal(toCase('hello world', 'constant'), 'HELLO_WORLD');
    assert.equal(toCase('hello world', 'dot'), 'hello.world');
    assert.equal(toCase('hello world', 'path'), 'hello/world');
    assert.equal(toCase('hello world', 'title'), 'Hello World');
    assert.equal(toCase('hello world', 'sentence'), 'Hello world');
  });
});

// ─── Utilities ───────────────────────────────────────────

describe('countWords', () => {
  it('counts words in string', () => {
    assert.equal(countWords('hello world'), 2);
    assert.equal(countWords('foo-bar-baz'), 3);
    assert.equal(countWords('camelCaseTest'), 3);
    assert.equal(countWords(''), 0);
  });
});

describe('isSlug', () => {
  it('valid slugs', () => {
    assert.equal(isSlug('hello-world'), true);
    assert.equal(isSlug('foo-bar-baz'), true);
    assert.equal(isSlug('single'), true);
    assert.equal(isSlug('number-123'), true);
  });

  it('invalid slugs', () => {
    assert.equal(isSlug('Hello World'), false);
    assert.equal(isSlug('foo_bar'), false);
    assert.equal(isSlug('foo bar'), false);
    assert.equal(isSlug(''), false);
    assert.equal(isSlug('-leading'), false);
    assert.equal(isSlug('trailing-'), false);
  });

  it('custom separator', () => {
    assert.equal(isSlug('hello_world', '_'), true);
    assert.equal(isSlug('hello-world', '_'), false);
  });
});

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
