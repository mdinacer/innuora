#!/bin/bash

# Base path
ICON_PATH="./assets/icons"

# iOS: Keep only common required sizes (exact filenames)
IOS_KEEP=("16.png" "32.png" "120.png" "152.png" "180.png" "192.png" "256.png" "512.png" "1024.png")

# Android: Keep the launcher icons that exist in your folder
ANDROID_KEEP=("android-launchericon-48-48.png" "android-launchericon-72-72.png" "android-launchericon-96-96.png" "android-launchericon-144-144.png" "android-launchericon-192-192.png" "android-launchericon-512-512.png")

# Windows: Keep standard tiles and splash screens (exact filenames)
WINDOWS_KEEP=(
  "SmallTile.scale-100.png" "SmallTile.scale-125.png" "SmallTile.scale-150.png" "SmallTile.scale-200.png" "SmallTile.scale-400.png"
  "LargeTile.scale-100.png" "LargeTile.scale-125.png" "LargeTile.scale-150.png" "LargeTile.scale-200.png" "LargeTile.scale-400.png"
  "SplashScreen.scale-100.png" "SplashScreen.scale-125.png" "SplashScreen.scale-150.png" "SplashScreen.scale-200.png" "SplashScreen.scale-400.png"
  "StoreLogo.scale-100.png" "StoreLogo.scale-125.png" "StoreLogo.scale-150.png" "StoreLogo.scale-200.png" "StoreLogo.scale-400.png"
  "Wide310x150Logo.scale-100.png" "Wide310x150Logo.scale-125.png" "Wide310x150Logo.scale-150.png" "Wide310x150Logo.scale-200.png" "Wide310x150Logo.scale-400.png"
  "Square44x44Logo.scale-100.png" "Square44x44Logo.scale-125.png" "Square44x44Logo.scale-150.png" "Square44x44Logo.scale-200.png" "Square44x44Logo.scale-400.png"
)

# Function to delete unused files in a directory
clean_dir() {
  local dir=$1
  shift
  local keep=("$@")
  
  echo "Cleaning $dir..."
  for file in "$dir"/*; do
    filename=$(basename "$file")
    if [[ ! " ${keep[@]} " =~ " ${filename} " ]]; then
      echo "Deleting $file"
      rm "$file"
    fi
  done
}

# Run cleanup
clean_dir "$ICON_PATH/ios" "${IOS_KEEP[@]}"
clean_dir "$ICON_PATH/android" "${ANDROID_KEEP[@]}"
clean_dir "$ICON_PATH/windows11" "${WINDOWS_KEEP[@]}"

echo "Cleanup complete."