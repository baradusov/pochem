"""Compose App Store screenshots: a caption on paper background over the framed app screen.

    python3 tools/store-screenshots/render.py [ru] [en]

Reads simulator captures from raw/{iphone,ipad}/{locale}-{shot}.png (a locale falls back
to ru- when it has no capture of its own) and writes upload/{locale}/{device}/NN.png,
laid out the way `asc screenshots upload` expects. See README.md.
"""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "raw")
OUT = os.path.join(HERE, "upload")
# App Store Connect locale for each caption language
STORE_LOCALES = {"ru": "ru", "en": "en-US"}
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Canvas sizes App Store accepts: iPhone 6.9" and iPad 13"
DEVICES = {
    "iphone": {"size": (1320, 2868), "screen_width": 1060, "radius": 112, "bezel": 22,
               "top": 680, "caption": 300, "font": 112, "margin": 110},
    "ipad": {"size": (2064, 2752), "screen_width": 1560, "radius": 44, "bezel": 30,
             "top": 640, "caption": 230, "font": 150, "margin": 200},
}

SLIDES = [
    {"shot": "1-hero",
     "ru": "Одна сумма —<br>все валюты сразу",
     "en": "One amount.<br>Every currency."},
    {"shot": "2-math",
     "ru": "Считайте<br>прямо при вводе",
     "en": "Do the math<br>as you type"},
    {"shot": "3-scrub", "gesture": {"iphone": (0.40, 0.495), "ipad": (0.16, 0.455)},
     "ru": "Тяните число —<br>прикидывайте цены",
     "en": "Drag a number<br>to try amounts"},
    {"shot": "4-search",
     "ru": "Более 50 валют<br>и быстрый поиск",
     "en": "50+ currencies,<br>easy to find"},
    {"shot": "5-history",
     "ru": "Вся история<br>расчётов под рукой",
     "en": "Your recent<br>conversions, saved"},
]

PAPER = "#F3F0E8"
INK = "#111111"
ACCENT = "#FF4F1F"


def shot_path(device: str, locale: str, shot: str) -> str:
    """Locale-specific capture if there is one (e.g. search typed in English), else the shared one."""
    own = os.path.join(RAW, device, f"{locale}-{shot}.png")
    return own if os.path.exists(own) else os.path.join(RAW, device, f"ru-{shot}.png")


def gesture_svg(x: float, y: float) -> str:
    """A fingertip on the number with arrows both ways: 'drag me'."""
    return f"""
    <svg class="gesture" style="left:{x * 100}%;top:{y * 100}%" viewBox="-260 -110 520 220">
      <path d="M-220 0 H-95 M-220 0 l34 -27 M-220 0 l34 27" />
      <path d="M220 0 H95 M220 0 l-34 -27 M220 0 l-34 27" />
      <circle r="56" class="touch" />
      <circle r="56" class="ring" />
    </svg>"""


def html(slide: dict, locale: str, device_name: str, device: dict) -> str:
    width, height = device["size"]
    screen = shot_path(device_name, locale, slide["shot"])
    gesture = gesture_svg(*slide["gesture"][device_name]) if slide.get("gesture") else ""
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ width: {width}px; height: {height}px; overflow: hidden; background: {PAPER}; }}
      body {{ font-family: -apple-system, "SF Pro Display", system-ui, sans-serif; color: {INK}; position: relative; }}
      h1 {{ position: absolute; top: {device['caption']}px; left: {device['margin']}px; right: 90px;
            font-size: {device['font']}px; line-height: 1.04; font-weight: 800; letter-spacing: -3px; }}
      .phone {{ position: absolute; top: {device["top"]}px; left: 50%;
                width: {device["screen_width"] + 2 * device["bezel"]}px; transform: translateX(-50%);
                padding: {device["bezel"]}px; background: {INK};
                border-radius: {device["radius"] + device["bezel"]}px;
                box-shadow: 0 40px 80px rgba(0,0,0,.18); }}
      .screen {{ position: relative; border-radius: {device["radius"]}px; overflow: hidden; line-height: 0; }}
      .screen img {{ width: 100%; display: block; }}
      .gesture {{ position: absolute; width: 520px; height: 220px; transform: translate(-50%, -50%); overflow: visible; }}
      .gesture path {{ stroke: {ACCENT}; stroke-width: 16; fill: none; stroke-linecap: round; stroke-linejoin: round; }}
      .gesture .touch {{ fill: {ACCENT}; opacity: .28; }}
      .gesture .ring {{ fill: none; stroke: {ACCENT}; stroke-width: 10; }}
    </style></head><body>
      <h1>{slide[locale]}</h1>
      <div class="phone"><div class="screen"><img src="file://{screen}">{gesture}</div></div>
    </body></html>"""


def render(page: str, size: tuple, target: str) -> None:
    os.makedirs(os.path.dirname(target), exist_ok=True)
    source = target.replace(".png", ".html")
    with open(source, "w") as f:
        f.write(page)
    subprocess.run([
        CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
        "--force-device-scale-factor=1", f"--window-size={size[0]},{size[1]}",
        f"--screenshot={target}", f"file://{source}",
    ], check=True, capture_output=True)
    os.remove(source)


def main() -> None:
    locales = sys.argv[1:] or list(STORE_LOCALES)
    for device_name, device in DEVICES.items():
        for locale in locales:
            for index, slide in enumerate(SLIDES, start=1):
                target = os.path.join(OUT, STORE_LOCALES[locale], device_name, f"{index:02}.png")
                render(html(slide, locale, device_name, device), device["size"], target)
                print(os.path.relpath(target, HERE))


if __name__ == "__main__":
    main()
