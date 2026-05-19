#!/usr/bin/env bash
# Downloads every /media/ asset referenced in the site into public/media/,
# preserving the same path structure so existing /media/<hash>/<file> URLs work.
set -euo pipefail

BASE="https://buildodyssey.com"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/media"
mkdir -p "$OUT"

urls=(
  # Homepage hero / featured imagery
  "/media/g2hfvs3i/odyssey-homes-idaho-falls.jpg"
  "/media/xkllvuu1/ashwood-2021-4-scaled.jpg"
  "/media/qymb1zvy/sprucewood-7-scaled.jpg"
  "/media/kmhpk1io/bonner-31-scaled.jpg"
  "/media/zwtj11z4/the-ashwood-9-scaled.jpg"
  "/media/c5updgdu/acorn-3-scaled.jpg"
  "/media/gcvn1ysy/the-ashwood-16-scaled.jpg"
  "/media/5x1h13zt/ashwood-2021-17-scaled.jpg"
  "/media/yq4njhuo/sprucewood-27-scaled.jpg"
  "/media/h1zl2rvr/acorn-7-scaled.jpg"
  "/media/clgjvybk/ashwood-2021-27-scaled.jpg"
  "/media/l5xcqxme/rockford-farmhouse-14-scaled.jpg"
  "/media/ookmf4q2/sprucewood-1-scaled.jpg"
  "/media/mnhbfai3/bonner-21-scaled.jpg"
  "/media/c4eeg1dy/bonner-28-scaled.jpg"
  "/media/atmpxawf/sprucewood-15-scaled.jpg"
  "/media/s3rdv30t/oakbrook-ashwood-15-scaled.jpg"
  "/media/r54jfanr/rockford-farmhouse-11-scaled.jpg"
  "/media/1kknfxki/ashwood-2021-24-scaled.jpg"
  "/media/xcobdagd/sprucewood-4-scaled-1.jpg"
  "/media/jqynwlhw/bonner-10-scaled.jpg"
  "/media/0lqnsmv2/sprucewood-19-scaled.jpg"
  "/media/0z3khxfp/sprucewood-22-scaled.jpg"
  "/media/exdfhx0e/acorn-4-scaled.jpg"
  "/media/2hmlcunu/rockford-farmhouse-23-scaled.jpg"
  "/media/1npdeeyt/oakbrook-ashwood-18-scaled.jpg"
  "/media/3aoi4sxx/ashwood-2021-20-scaled.jpg"
  "/media/qeel2eka/ashwood-2021-33-scaled.jpg"
  "/media/13ip0hm/bonner-30-scaled.jpg"
  "/media/kkaix4q2/oakbrook-ashwood-10-scaled.jpg"
  "/media/bxdl4lco/ashwood-2021-15-scaled.jpg"
  "/media/ksbdfe4j/ashwood-2021-8-scaled.jpg"
  "/media/egldddwe/ashwood-2021-47-scaled.jpg"
  "/media/j4jjrsjq/sprucewood-9-scaled.jpg"
  "/media/usnibfqp/sprucewood-24-scaled.jpg"
  "/media/ryyobvwd/bonner-13-scaled.jpg"
  "/media/qvaf4xs0/ashwood-2021-2-scaled.jpg"
  "/media/ovpphel5/sprucewood-40-scaled.jpg"
  "/media/0ylpy4sh/sprucewood-2-scaled.jpg"
  "/media/fq0luypf/sprucewood-12-scaled.jpg"
  "/media/3okaf42t/ashwood-2021-35-scaled.jpg"
  "/media/5fypinv4/bonner-39-scaled.jpg"
  "/media/bq1jdemo/rockford-farmhouse-47-scaled.jpg"
  "/media/0lsbk5mm/acorn-5-scaled.jpg"
  "/media/jrekc14j/ashwood-2021-51-scaled.jpg"
  # Cross-promo (Guardian luxury homes section)
  "/media/dwekiobk/custom-home-4.jpg"
  "/media/gwzb4ybr/custom-home-7.jpg"
  "/media/benn0uua/custom-home-5.jpg"
  "/media/44ubcln0/custom-home-6.jpg"
  "/media/qrkguqcy/custom-home-2.jpg"
  "/media/savnoyr0/custom-home-3.jpg"
  # Communities
  "/media/uiwjnc4d/granitecreek_featuredimage-opt.jpg"
  "/media/dq5d1fgo/hawks-landing-neighborhood-in-idaho-falls-entrance-1-2048x1365.jpg"
  "/media/ruibxzeq/20250314_124453-opt.jpg"
  # Plan exteriors / floor plans
  "/media/quqab0wv/cottage-front-exterior.jpg"
  "/media/tf2dyj0e/cottage-main-20.png"
  "/media/gwnp2k2y/cottage-basement.png"
  "/media/dtubu2m2/oleander-front-exterior.jpg"
  "/media/kenf4fkm/oleander-main.jpg"
  "/media/2nwofbfx/oleander-basement.jpg"
  "/media/vcjn0ffb/ponderosa-front-exterior.jpg"
  "/media/s0bbcucs/ponderosa-main.png"
  "/media/hg1hesh3/ponderosa-basement-floor.png"
  "/media/ho0ftc12/willow-front-exterior.jpg"
  "/media/sotle4ra/willow-main-floor.jpg"
  "/media/dbajf1ho/willow-basement.jpg"
  # Team headshots
  "/media/z3akmgp5/headshots-010724-27-1.jpg"
  "/media/rbse31rv/headshots-010724-28-1.jpg"
  "/media/aggl5qin/img_4846-1.jpg"
  "/media/i5cldyim/img_4850-1.jpg"
  "/media/rf3bqw4a/headshots-010724-12-1.jpg"
  "/media/rywjeszz/headshots-010724-3-1.jpg"
  "/media/j3sh2ujv/headshots-010724-5-1.jpg"
  "/media/lbrm5os2/gary-rasmussen-real-estate-agent-east-idaho.jpg"
  # Blog featured images
  "/media/knxbi1x2/how-idaho-falls-semi-custom-home-builders-adapt-homes-for-the-seasons.jpg"
  "/media/2chl5ixs/pet-friendly-semi-custom-homes.jpeg"
  "/media/apljhdjq/important-topics-to-consider-when-choosing-a-semi-custom-home.jpeg"
)

count=0
fails=0
for url in "${urls[@]}"; do
  target="$OUT${url#/media}"
  mkdir -p "$(dirname "$target")"
  if curl -sSf -o "$target" "$BASE$url"; then
    count=$((count + 1))
  else
    echo "FAIL: $url" >&2
    fails=$((fails + 1))
  fi
done

echo "Downloaded $count files. Failures: $fails."
