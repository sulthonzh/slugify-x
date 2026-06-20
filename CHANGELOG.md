# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-06-20

### Added
- VERSION export constant for programmatic version checking
- --version / -V / version CLI flags
- exports field for clean ESM/CJS dual consumption
- engines field (Node >= 18.0.0)
- test:core npm script (runs compiled dist tests)
- CHANGELOG.md to npm files field

### Changed
- Updated test script to use tsx for direct TypeScript execution (faster development)
- Updated README with compelling hook and usage stats
- Updated package.json with modern ESM/CJS export configuration

### Improved
- README now includes 3 real-world examples (CMS URLs, API endpoints, SEO slugs)
- README now includes comparison table vs alternatives
- README hook now includes test count and zero-dep status

## [1.0.0] - 2026-06-17

### Added
- Initial release
- Zero-dependency slugify function with Unicode transliteration
- 9 case conversion functions (camel, pascal, snake, kebab, constant, dot, path, title, sentence)
- Word splitting utility (handles camelCase, PascalCase, CONSTANT_CASE)
- Utilities: capitalize, uncapitalize, countWords, isSlug, truncateSlug
- CLI with 8 commands (slugify, case, words, check, truncate, demo, help, version)
- Custom separators, max length truncation, emoji removal
- Custom replacements map
- 63 tests covering all functionality