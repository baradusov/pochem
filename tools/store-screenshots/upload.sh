#!/usr/bin/env bash
# Replace App Store screenshots of an editable version with the rendered ones.
#   tools/store-screenshots/upload.sh 26.10.1
set -euo pipefail

VERSION="${1:?usage: upload.sh VERSION}"
APP_ID="6758133115"
DIR="$(cd "$(dirname "$0")" && pwd)/upload"

for locale in ru en-US; do
  asc screenshots upload --app "$APP_ID" --version "$VERSION" --locale "$locale" \
    --path "$DIR/$locale/iphone" --device-type IPHONE_67 --replace --confirm
  asc screenshots upload --app "$APP_ID" --version "$VERSION" --locale "$locale" \
    --path "$DIR/$locale/ipad" --device-type IPAD_PRO_3GEN_129 --replace --confirm
done
