#!/usr/bin/env bash
set -euo pipefail

# Load env from .env.sepolia
set -a
source "$(dirname "$0")/.env.sepolia"
set +a

# ── Config ──
GAME_MASTER="0x05D37f02D23fBdC61778dD108A5b239bea7B03e8590bbfCA4c7839fcB30321a5"
FEE_RECIPIENT="$GAME_MASTER"
VERIFIER="0x00dd86587a5fac0f1cfddf76e768d6110deeca70357f8827d7b0635aa94eb582"
MIN_PLAYERS=2
PLATFORM_FEE_BPS=0

echo "Initializing tournament_manager..."
echo "  game_master:  $GAME_MASTER"
echo "  fee_recipient: $FEE_RECIPIENT"
echo "  verifier:     $VERIFIER"
echo "  min_players:  $MIN_PLAYERS"
echo "  fee_bps:      $PLATFORM_FEE_BPS"
echo ""

sozo --profile sepolia execute \
  tweetle_dojo-tournament_manager initialize \
  "$GAME_MASTER" "$FEE_RECIPIENT" "$VERIFIER" "$MIN_PLAYERS" "$PLATFORM_FEE_BPS"

echo "Done!"
