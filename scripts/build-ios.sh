#!/usr/bin/env bash
# Build a signed iOS .ipa locally and optionally upload to an existing GitHub Release.
#
# Usage:
#   pnpm build:ios              # build only → health-tracker-ios.ipa
#   pnpm build:ios v1.2.3       # build + upload to GitHub Release v1.2.3
#
# Prerequisites (one-time setup):
#   1. Install Xcode from the App Store
#   2. Open Xcode → Settings → Accounts → add your Apple ID
#   3. Connect your iPhone and trust this Mac (device UDID is registered automatically)
#   4. Install CocoaPods: sudo gem install cocoapods
#
# The .ipa is signed with your free Apple ID personal-team certificate.
# It expires every 7 days — re-run this script to renew.

set -euo pipefail

RELEASE_TAG="${1:-}"
OUTPUT_IPA="health-tracker-ios.ipa"
BUILD_DIR="build/ios"
ARCHIVE_PATH="${BUILD_DIR}/App.xcarchive"
EXPORT_DIR="${BUILD_DIR}/export"
EXPORT_OPTIONS="$(dirname "$0")/ios-export-options.plist"

# ── 1. Generate native iOS project ───────────────────────────────────────────
echo "==> Generating native iOS project (expo prebuild)..."
npx expo prebuild --platform ios --clean

# ── 2. Detect workspace and scheme ───────────────────────────────────────────
WORKSPACE=$(find ios -maxdepth 1 -name "*.xcworkspace" | head -1)
if [[ -z "$WORKSPACE" ]]; then
  echo "Error: no .xcworkspace found under ios/ after prebuild" >&2
  exit 1
fi
SCHEME=$(basename "$WORKSPACE" .xcworkspace)
echo "==> Workspace: ${WORKSPACE}  Scheme: ${SCHEME}"

# ── 3. Archive ────────────────────────────────────────────────────────────────
echo "==> Building archive (this takes a few minutes)..."
mkdir -p "${BUILD_DIR}"
xcodebuild \
  -workspace "${WORKSPACE}" \
  -scheme "${SCHEME}" \
  -configuration Release \
  -archivePath "${ARCHIVE_PATH}" \
  -allowProvisioningUpdates \
  archive \
  | grep -E "^(error:|warning:|Build succeeded|Archive succeeded|FAILED)" || true

# ── 4. Export .ipa ────────────────────────────────────────────────────────────
echo "==> Exporting .ipa..."
xcodebuild \
  -exportArchive \
  -archivePath "${ARCHIVE_PATH}" \
  -exportPath "${EXPORT_DIR}" \
  -exportOptionsPlist "${EXPORT_OPTIONS}" \
  -allowProvisioningUpdates \
  | grep -E "^(error:|warning:|Export succeeded|FAILED)" || true

IPA_SRC=$(find "${EXPORT_DIR}" -name "*.ipa" | head -1)
if [[ -z "$IPA_SRC" ]]; then
  echo "Error: export succeeded but no .ipa found in ${EXPORT_DIR}" >&2
  exit 1
fi
cp "${IPA_SRC}" "${OUTPUT_IPA}"
echo "==> Built: ${OUTPUT_IPA}"

# ── 5. Upload to GitHub Release (optional) ───────────────────────────────────
if [[ -n "$RELEASE_TAG" ]]; then
  echo "==> Uploading to GitHub Release ${RELEASE_TAG}..."
  gh release upload "${RELEASE_TAG}" "${OUTPUT_IPA}" --clobber
  echo "==> Uploaded: $(gh release view "${RELEASE_TAG}" --json url -q .url)"
else
  echo ""
  echo "Tip: to upload to a GitHub Release, run:"
  echo "  pnpm build:ios v<tag>"
  echo ""
  echo "Install on iPhone via Sideloadly:"
  echo "  1. Connect iPhone to Mac"
  echo "  2. Open Sideloadly, drag ${OUTPUT_IPA} into the window"
  echo "  3. Enter your Apple ID and click Start"
fi
