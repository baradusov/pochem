# Changelog

All notable changes to this project will be documented in this file.

This project uses [CalVer](https://calver.org/) versioning: `YY.MM.patch`

## [25.2.1] - 2025-02-01

### Added

- Currency converter with real-time exchange rates
- Support for multiple currencies (USD, EUR, RUB, etc.)
- Currency selection screen
- Configurable number of currency blocks
- Manual exchange rate refresh
- Rate caching with smart invalidation
- Clear button for quick reset
- Build number display

### Fixed

- Exchange rates not updating after currency change
- Cache validation now uses correct timestamp
- Display rate date instead of API check date

### Developer Experience

- ESLint + Prettier setup with Expo config
- GitHub Actions CI (lint + typecheck)
- Contributing guidelines
- Issue and PR templates
