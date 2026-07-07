# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-06-26

### Added
- `toCase()` generic case conversion function
- `truncateSlug()` utility for word-boundary-safe truncation
- `uncapitalize()` utility
- `countWords()` utility
- `isSlug()` validator
- `splitWords()` word splitter (handles camelCase, PascalCase, CONSTANT_CASE, digit boundaries)
- CLI `demo`, `check`, `truncate`, `words` subcommands
- Unicode transliteration map (ß→ss, ø→o, æ→ae, þ→th, and more)
- Emoji removal support (`removeEmojis` option)
- Custom replacements (`replacements` option)
- `preserveCase` option
- `locale` option placeholder for future locale-specific transliteration

### Changed
- Zero dependencies — no lodash, no unicode packages
- NFKD normalization + manual transliteration map for comprehensive Unicode coverage

## [1.0.0] - 2025-06-24

### Added
- Initial release
- `slugify()` with separator, lower, maxLength options
- 9 case conversions: camel, pascal, snake, kebab, constant, dot, path, title, sentence
- CLI with `slugify`, `case`, `version` commands
