# App Store screenshots

Captions on a paper background over a framed app screen, for iPhone 6.9" (1320×2868) and iPad 13" (2064×2752), in Russian and English.

Requires Google Chrome (headless rendering), Python 3, Xcode simulators and, for uploading, the [`asc`](https://asccli.sh) CLI (`brew install asc`) authenticated to the App Store Connect account.

## 1. Capture

Build a Release app for the simulator and run it on **iPhone 17 Pro Max** and **iPad Pro 13-inch**. Give both a clean status bar:

```bash
xcrun simctl status_bar booted override --time 9:41 --batteryState discharging --batteryLevel 100 --wifiBars 3 --cellularBars 4
```

Capture each state with `xcrun simctl io booted screenshot <file>` into `raw/iphone/` and `raw/ipad/`:

| File | State |
|---|---|
| `ru-1-hero.png` | Main screen with an amount (scrub EUR to 40) |
| `ru-2-math.png` | Typing an expression, e.g. `180 ÷ 3` in GEL, keyboard open |
| `ru-3-scrub.png` | Main screen after scrubbing RUB to a round amount |
| `ru-4-search.png` | Currency picker searching «доллар» |
| `ru-5-history.png` | Settings with a few history entries |
| `en-4-search.png` | Currency picker searching "dollar" |

Any shot without an `en-` version is shared by both languages. Captions and the drag gesture position on slide 3 live in `render.py`.

## 2. Render

```bash
python3 tools/store-screenshots/render.py
```

Writes `upload/{ru,en-US}/{iphone,ipad}/01…05.png`.

## 3. Upload

Screenshots of a released version can't be changed, so upload to a version that is still being prepared:

```bash
tools/store-screenshots/upload.sh 26.10.1
```

It replaces both device sets in both locales.
