# Changelog

All notable changes to this project will be documented in this file.

This project uses [CalVer](https://calver.org/) versioning: `YY.MM.patch`

**Note:** Versions 25.x were released in 2026 with an incorrect year prefix. Starting from 26.2.3, the correct year is used.

## [26.10.1] - 2026-10-16

### Changed

- App Store page in English and new screenshots

## [26.10.0] - 2026-10-13

### Added

- Drag a number left or right to scrub through round amounts, with haptic ticks
- Long press on a currency block copies its amount
- Currency search by code, name, country or city in English and Russian, symbol, and text typed in the wrong keyboard layout
- Flags and full names in the currency picker; Return picks the top result
- Scrubbing saves to history too
- History shows Today / Yesterday and the time of each conversion

### Changed

- While typing, the edited currency expands and the others shrink so all stay visible above the keyboard
- Amounts in all blocks share one font size and use tabular figures
- Expressions show × ÷ − instead of * / -
- Whole amounts are shown without trailing ",00"
- Copy button moved next to the currency code
- Picking a currency that is already on screen swaps the two instead of being disabled
- History keeps 50 entries and skips repeats

### Fixed

- Logo overlapping the copy button in the last block
- System Paste/Select menu popping up on tap in the input field and swallowing key presses
- History entries made after midnight UTC grouped under the wrong day

## [26.3.0] - 2026-03-11

### Added

- Cursor positioning in calculator input

## [26.2.6] - 2026-02-28

### Fixed

- Exchange rates now available in regions where Cloudflare is not accessible
- Added fallback exchange rate sources for improved reliability

## [26.2.5] - 2026-02-22

### Added

- Calculator keyboard with arithmetic operations (+, −, ×, ÷)
- Haptic feedback on key presses
- Long press on backspace to clear all input

## [26.2.4] - 2026-02-14

### Fixed

- Exchange rates not updating when app returns from background
- Stale exchange rates due to CDN caching (switched to Cloudflare Pages API)

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
