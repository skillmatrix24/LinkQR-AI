#!/bin/bash
find src -type f \( -name "*.tsx" \) -print0 | xargs -0 sed -i 's/<style jsx global>/<style>/g'
find src -type f \( -name "*.tsx" \) -print0 | xargs -0 sed -i 's/<style global jsx>/<style>/g'
find src -type f \( -name "*.tsx" \) -print0 | xargs -0 sed -i 's/<style jsx>/<style>/g'
find src -type f \( -name "*.tsx" \) -print0 | xargs -0 sed -i 's/<style global>/<style>/g'
