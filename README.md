# slugify-x

Zero-dependency URL slug generator and string case conversion library for Node.js.

## Why

Every project needs slugs. Most slug libraries either pull in 20 dependencies or handle only basic ASCII. `slugify-x` transliterates Unicode (Café → cafe, Straße → strasse, Øresund → oresund), converts between 9 case formats, and ships a CLI — all with **zero dependencies**.

## Install

```bash
npm install slugify-x
```

## Quick Start

```js
const { slugify } = require('slugify-x');

slugify('Hello, World!');           // → 'hello-world'
slugify('Café Résumé');             // → 'cafe-resume'
slugify('Straße München');          // → 'strasse-munchen'
slugify('Héllo Wörld', { separator: '_' });  // → 'hello_world'
```

## Slugify Options

```js
slugify('Hello 🎉 World', {
  separator: '-',        // word separator (default: '-')
  lower: true,           // lowercase output (default: true)
  maxLength: 20,         // truncate at word boundary
  removeEmojis: true,    // strip emoji characters
  replacements: {        // custom text replacements (applied first)
    'C++': 'cpp',
    '.NET': 'dotnet'
  }
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `separator` | `string` | `'-'` | Character between words |
| `lower` | `boolean` | `true` | Convert to lowercase |
| `preserveCase` | `boolean` | `false` | Keep original casing |
| `maxLength` | `number` | — | Max slug length (truncates at separator) |
| `replacements` | `Record<string,string>` | `{}` | Custom replacements before processing |
| `removeEmojis` | `boolean` | `false` | Strip emoji and pictographs |

## Case Conversions

```js
const { toCamelCase, toPascalCase, toSnakeCase, toKebabCase,
        toConstantCase, toDotCase, toPathCase,
        toTitleCase, toSentenceCase } = require('slugify-x');

toCamelCase('hello world');     // → 'helloWorld'
toPascalCase('hello world');    // → 'HelloWorld'
toSnakeCase('HelloWorld');      // → 'hello_world'
toKebabCase('hello_world');     // → 'hello-world'
toConstantCase('hello world');  // → 'HELLO_WORLD'
toDotCase('hello world');       // → 'hello.world'
toPathCase('hello world');      // → 'hello/world'
toTitleCase('hello world');     // → 'Hello World'
toSentenceCase('HELLO WORLD');  // → 'Hello world'
```

### Generic `toCase()`

```js
const { toCase } = require('slugify-x');

toCase('hello world', 'camel');   // → 'helloWorld'
toCase('hello world', 'snake');   // → 'hello_world'
```

## Utilities

```js
const { splitWords, capitalize, countWords, isSlug, truncateSlug } = require('slugify-x');

splitWords('camelCaseTest');     // → ['camel', 'Case', 'Test']
splitWords('XMLHttpRequest');    // → ['XML', 'Http', 'Request']
capitalize('hello');             // → 'Hello'
countWords('foo-bar-baz');       // → 3
isSlug('hello-world');           // → true
isSlug('Hello World');           // → false
truncateSlug('hello-world-foo', 10);  // → 'hello'
```

## Unicode Support

Uses NFKD normalization + manual transliteration map for characters NFKD doesn't handle:

| Input | Output |
|-------|--------|
| `Café` | `cafe` |
| `Résumé` | `resume` |
| `München` | `munchen` |
| `Straße` | `strasse` |
| `Øresund` | `oresund` |
| `Æsop` | `aesop` |
| `Señor` | `senor` |
| `naïve` | `naive` |

## CLI

```bash
# Generate slug
slugify-x "Hello, World!"
# → hello-world

# Custom separator
slugify-x "Café Résumé" --sep _
# → cafe_resume

# Max length
slugify-x "A Very Long Title" --max 10
# → a-very

# Strip emojis
slugify-x "Hello 🎉 World" --no-emoji
# → hello-world

# Case conversion
slugify-x case camel "hello world foo"
# → helloWorldFoo

slugify-x case snake "HelloWorld"
# → hello_world

# Split words
slugify-x words "camelCaseExample"
# → ["camel","Case","Example"]

# Check valid slug
slugify-x check "hello-world"
# → true

# Demo
slugify-x demo
```

## Zero Dependencies

No `lodash`, no `unicode` packages, no `change-case`. Just Node.js built-ins.

## License

MIT
