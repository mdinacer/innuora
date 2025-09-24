#!/bin/bash

# Path to splash screens folder
FOLDER="./splash_screens"

# List of used files from your manifest
USED=(
"10.2__iPad_landscape.png"
"10.2__iPad_portrait.png"
"10.5__iPad_Air_landscape.png"
"10.5__iPad_Air_portrait.png"
"10.9__iPad_Air_landscape.png"
"10.9__iPad_Air_portrait.png"
"11__iPad_Pro_M4_landscape.png"
"11__iPad_Pro_M4_portrait.png"
"12.9__iPad_Pro_landscape.png"
"12.9__iPad_Pro_portrait.png"
"iPhone_11_Pro_Max__iPhone_XS_Max_landscape.png"
"iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png"
"iPhone_11__iPhone_XR_landscape.png"
"iPhone_11__iPhone_XR_portrait.png"
"iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_landscape.png"
"iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png"
"iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png"
"iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png"
"4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png"
"4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png"
"8.3__iPad_Mini_landscape.png"
"8.3__iPad_Mini_portrait.png"
"icon.png"
)

echo "Unused splash screens:"
for f in "$FOLDER"/*; do
  filename=$(basename "$f")
  if [[ ! " ${USED[@]} " =~ " ${filename} " ]]; then
    echo "$filename"
    # Uncomment the next line to actually delete
    rm "$f"
  fi
done