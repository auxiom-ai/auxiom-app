#!/usr/bin/env bash testing egd8eg
# fetch-119.sh  – downloads every BILLSTATUS XML that exists for the 119th Congress
set -euo pipefail
CONGRESS=119
TYPES=(hr s hjres sjres hconres sconres hres sres)
TARGET="data-$CONGRESS"

mkdir -p "$TARGET"

for t in "${TYPES[@]}"; do
  echo "⏬  $t"
  SITE="https://www.govinfo.gov/sitemap/bulkdata/BILLSTATUS/${CONGRESS}${t}/sitemap.xml"
  curl -s "$SITE" |
    grep -o 'https[^<]\+\.xml' |
    xargs -n1 -P4 -I{} bash -c '
      url="$1"; dst="'"$TARGET"'/'"$t"'/${url##*/}"
      mkdir -p "'"$TARGET"'/'"$t"'"
      [ -f "$dst" ] || curl -s -o "$dst" "$url"
    ' _ {}
done

echo "✅  $(find "$TARGET" -name "*.xml" | wc -l) XML files saved in $TARGET/"
