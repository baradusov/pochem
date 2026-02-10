# Changelog

All notable changes to this project will be documented in this file.

This project uses [CalVer](https://calver.org/) versioning: `YY.MM.patch`

**Note:** Versions 25.x were released in 2026 with an incorrect year prefix. Starting from 26.2.3, the correct year is used.

## [26.2.3] - 2026-02-10

### Added

- Copy button to copy currency amount to clipboard (without formatting spaces)
- Press animation on copy and clear action icons
- ClipboardPort for clipboard operations (ports & adapters pattern)

### Changed

- Clear icon replaced with Feather `x` icon for visual consistency
- Copy and clear buttons grouped in a shared actions container

## [25.2.2] - 2025-02-03

### Added

- Conversion history (last 10 entries, persisted in AsyncStorage)
- Tap history entry to restore currencies and amounts
- History grouped by date in Settings screen

### Changed

- Settings screen now scrollable with Settings and History sections
- Extracted utility functions to `core/utils/`

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
