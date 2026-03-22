#!/bin/bash

# A deploy/target.yaml alapján a backend a 3000-es porton fut
TARGET_URL="http://localhost:3000/api/healthz"

echo "🚀 Smoke teszt indítása..."
echo "Célpont: $TARGET_URL"

# Retry logika: 5-ször próbálkozunk, hátha lassan indul a szerver
for i in {1..5}
do
  # curl -f: hibát dob, ha a HTTP kód nem 200-as (pl. 404 vagy 500)
  # -s: csendes mód
  if curl -f -s "$TARGET_URL" > /dev/null
  then
    echo "✅ SIKER: A backend elérhető és válaszol (HTTP 200)."
    exit 0
  else
    echo "⏳ ($i/5) A szerver még nem elérhető, várakozás..."
    sleep 2
  fi
done

echo "❌ HIBA: A smoke teszt meghiúsult. A szerver nem válaszolt."
exit 1